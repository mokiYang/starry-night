'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-undef */
function onInitMenus() {
  return new Action('openSidebar', 'pages/sidebar/index.html', 'Starry starry night', 340);
}
async function getUser() {
  const user = await DocumentApp.getActiveDocument().getUser();
  return {
    accessToken: user.getAccessToken(),
    openId: user.getOpenId(),
    nick: user.getNick(),
    avatar: user.getAvatar(),
  };
}
async function getFileMetadata() {
  const fileMetadata = await DocumentApp.getActiveDocument().getFileMetadata();
  return {
    fileId: fileMetadata.getFileId(),
    fileType: fileMetadata.getFileType(),
  };
}
async function getAddonMetadata() {
  const addonMetadata = await DocumentApp.getActiveDocument().getAddonMetadata();
  if (addonMetadata) {
    return addonMetadata.getAddonId();
  }
}
function insertText(textObj) {
  DocumentApp.getActiveDocument().getCursor()
    .insertText(JSON.stringify(textObj));
}

exports.getAddonMetadata = getAddonMetadata;
exports.getFileMetadata = getFileMetadata;
exports.getUser = getUser;
exports.insertText = insertText;
exports.onInitMenus = onInitMenus;
