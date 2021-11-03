export const maxBranches = (limit) => {
  let generationCount = limit;

  if (limit > 1) {
    generationCount *= maxBranches(limit - 1);
  }

  return generationCount;
};

// update renderer and camera to match window/canvas size.
export const resizeRendererToDisplaySize = (renderer, camera) => {
    const canvas = renderer.domElement;
    const pixelRatio = window.devicePixelRatio;
    const width = (canvas.clientWidth * pixelRatio) | 0;
    const height = (canvas.clientHeight * pixelRatio) | 0;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }
    return needResize;
  };
