/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-undef */
export function onInitMenus() {
  return new Action('openSidebar', 'pages/sidebar/index.html', 'Starry starry night', 340);
};

export async function getUser() {
  const user = await DocumentApp.getActiveDocument().getUser();
  return {
    accessToken: user.getAccessToken(),
    openId: user.getOpenId(),
    nick: user.getNick(),
    avatar: user.getAvatar(),
  };
};

export async function getFileMetadata() {
  const fileMetadata = await DocumentApp.getActiveDocument().getFileMetadata();
  return {
    fileId: fileMetadata.getFileId(),
    fileType: fileMetadata.getFileType(),
  };
};

export async function getAddonMetadata() {
  const addonMetadata = await DocumentApp.getActiveDocument().getAddonMetadata();
  if (addonMetadata) {
    return addonMetadata.getAddonId();
  }
};

export function insertText(textObj) {
  DocumentApp.getActiveDocument().getCursor()
    .insertText(JSON.stringify(textObj));
}
