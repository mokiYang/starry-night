import { useEffect } from 'react';
import * as THREE from 'three';
import axios from 'axios';

import StarTextures from '../textures/star.png';
import CloudTextures from '../textures/cloud.png';
import Prince from '../textures/prince.png';
import './App.css';

const App = () => {
  let mouseX = 0;
  let mouseY = 40;
  let isInit = false;
  let isInitStar = true;
  let currentNumOfStars = 0;
  let expectNumOfStars = 15;
  let delta: any;

  const windowHalfX = window.innerWidth / 2;
  const windowHalfY = window.innerHeight / 2;
  // 相机视野范围
  const nearPlane = 1;
  const farPlane = 1000;
  const fieldOfView = 75;
  const aspectRatio = window.innerWidth / window.innerHeight;

  const starObjectUid: string[] = [];
  const cloudObjectUid: string[] = [];
  const textureLoader = new THREE.TextureLoader();
  const camera = new THREE.PerspectiveCamera(fieldOfView, aspectRatio, nearPlane, farPlane);
  const renderer = new THREE.WebGLRenderer();
  const scene = new THREE.Scene({ antialias: true });
  const clock = new THREE.Clock();
  const starPositionScale = 0.0004;

  // 节点初始化
  const init = () => {
    camera.position.z = farPlane / 2;

    scene.fog = new THREE.FogExp2(0x000000, 0.0003); // 0x0000ff, 0.001

    // initPlanet();
    initCloud();
    updateExpectNumOfStars()

    renderer.setClearColor(0x000011, 1);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById("root")?.appendChild(renderer.domElement);

    document.body.style.touchAction = 'none';
    document.body.addEventListener('pointermove', onPointerMove);
    document.body.addEventListener('mouseleave', onMouseLeave);
    window.addEventListener('resize', onWindowResize);

    setInterval(() => {
      setTimeout(async () => {
        await updateExpectNumOfStars()
        addStar()
      }, 0)
    }, 5000)
    isInit = true;
  }

  const onWindowResize = () => {
    camera.aspect = aspectRatio;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  const onPointerMove = (event: any) => {
    mouseX = event.clientX - windowHalfX;
    mouseY = event.clientY - windowHalfY;
  }

  // 鼠标离开时仅保持 y 轴方向的慢速移动
  const onMouseLeave = () => {
    mouseX = 0;
    mouseY = mouseY > 0 ? 40 : -40;
  }

  const addStar = () => {
    if (currentNumOfStars === expectNumOfStars) {
      return
    }
    const starGeometry = new THREE.BufferGeometry();
    const vertices = [];
    const size = 200;

    for (let i = currentNumOfStars; i < expectNumOfStars; i++) {
      let x, y, z: number;
      // 前 40 颗星星生成在相机可视区域内
      if (i < 40) {
        z = i < 6 ? Math.random() * (440 - size) + size : Math.random() * 440 - 440 / 2;
        const distance = farPlane / 2 - Math.abs(z);
        // 计算宽高范围
        const frustumHeight = 2 * distance * Math.tan(fieldOfView * 0.5 * ((Math.PI * 2) / 360));
        const frustumWidth = frustumHeight * aspectRatio;
        x = Math.random() * frustumWidth - frustumWidth / 2;
        y = Math.abs(Math.random() * frustumHeight - frustumHeight / 2);
      } else {
        x = THREE.MathUtils.randFloatSpread(2000);
        y = THREE.MathUtils.randFloatSpread(2000);
        z = THREE.MathUtils.randFloatSpread(2000);
      }

      vertices.push(x, y, z);
    }

    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

    const material = new THREE.PointsMaterial({
      size: 15,
      map: textureLoader.load(StarTextures),
      sizeAttenuation: true,
      alphaTest: 0.10,
      transparent: true
    });

    const particles = new THREE.Points(starGeometry, material);
    starObjectUid.push(particles.uuid);
    scene.add(particles);
    currentNumOfStars = expectNumOfStars
  }

  const updateExpectNumOfStars = async () => {
    // @ts-ignore
    const userInfo = await window.docs.app.run.getUser()
    // @ts-ignore
    const fileMeta = await window.docs.app.run.getFileMetadata()
    // @ts-ignore
    const addonId = await window.docs.app.run.getAddonMetadata()
    axios({
      method: 'get',
      url: 'https://testproxy.tencentsuite.com/visitors',
      headers: {
        'Open-Id': userInfo.openId,
        'Client-Id': addonId,
        'Access-Token': userInfo.accessToken,
      },
      params: {
        pad_id: fileMeta.fileId.replace('300000000$', '')
      }
    }).then(function (response) {
      if (response.data.Count === 0) {
        expectNumOfStars = 1;
      } else if (response.data.Count < 20) {
        expectNumOfStars = response.data.Count
      } else {
        expectNumOfStars = Math.log2(response.data.Count) + 17
      }
      if (isInitStar) {
        addStar();
        isInitStar = false;
      }
    }).catch(() => {
      if (isInitStar) {
        addStar();
        isInitStar = false;
      }
    })
  }

  const initCloud = () => {
    // 增加光源
    const light = new THREE.DirectionalLight(0xffffff, 0.5);
    light.position.set(0, 0, 340);
    scene.add(light);

    // 设置云材质
    const cloudMaterial = new THREE.MeshLambertMaterial({
      color: 0xffffff,
      map: textureLoader.load(CloudTextures),
      transparent: true
    });
    const cloudGeometry = new THREE.PlaneGeometry(300, 300);
    // 云团坐标
    const vertices = [
      {
        x: -100,
        y: 30,
        z: 340,
      },
      {
        x: 100,
        y: -60,
        z: 400,
      }
    ];

    for (let p = 0; p < vertices.length; p++) {
      const particle = new THREE.Mesh(cloudGeometry, cloudMaterial);

      particle.position.set(vertices[p].x, vertices[p].y, vertices[p].z);
      particle.rotation.z = Math.random() * 360;

      cloudObjectUid.push(particle.uuid);
      scene.add(particle);
    }
  }

  const animate = () => {
    render();
    requestAnimationFrame(animate);
  }

  const render = () => {
    // 控制星星移动
    // @ts-ignore
    starObjectUid.forEach(uid => {
      // @ts-ignore
      scene.children.forEach(item => {
        if (uid === item.uuid) {
          if (Math.abs(item.position.x) > farPlane) { // 超出某个范围区
            item.position.x = -1 * item.position.x;
          }
          item.position.x += mouseX * starPositionScale;

          if (Math.abs(item.position.y) > farPlane) { // 超出某个范围区
            item.position.y = -1 * item.position.y;
          }
          item.position.y -= mouseY * starPositionScale / 2;
        }
      });
    })

    delta = clock.getDelta();
    // 控制云朵移动
    cloudObjectUid.forEach(uid => {
      // @ts-ignore
      scene.children.forEach(item => {
        if (item.uuid === uid) {
          item.position.x += (mouseX - camera.position.x) * 0.0001;
          item.rotation.z += (delta * 0.04);
        }
      });
    })

    renderer.render(scene, camera);
  }

  useEffect(() => {
    if (!isInit) {
      init();
    }
  }, [isInit])

  useEffect(() => {
    if (isInit) {
      animate();
    }
  }, [])

  return <>
    <img
      src={Prince}
      alt='prince'
      width={window.innerWidth * 0.8}
      height={window.innerWidth * 0.8}
      className='prince'
    />
  </>;
}

export default App;
