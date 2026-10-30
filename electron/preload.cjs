const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  minimize: () => ipcRenderer.invoke('window-minimize'),
  maximize: () => ipcRenderer.invoke('window-maximize'),
  close: () => ipcRenderer.invoke('window-close'),
  isMaximized: () => ipcRenderer.invoke('window-is-maximized'),
  saveProject: (defaultName, content) =>
    ipcRenderer.invoke('project-save', { defaultName, content }),
  openProject: () =>
    ipcRenderer.invoke('project-open'),
  onMaximizedChange: (callback) => {
    const handler = (_event, val) => callback(val);
    ipcRenderer.on('window-maximized-change', handler);
    return () => {
      ipcRenderer.removeListener('window-maximized-change', handler);
    };
  },
});
