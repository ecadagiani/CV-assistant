// eslint-disable-next-line import/prefer-default-export
export const float32Buffer = (arr) => {
  const floatArray = new Float32Array(arr);
  const buffer = Buffer.from(floatArray.buffer);
  return buffer;
};
