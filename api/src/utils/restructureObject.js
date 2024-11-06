export function restructureObject(obj) {
  const result = {};

  Object.keys(obj).forEach((key) => {
    if (key.includes('.')) {
      const parts = key.split('.');
      let target = result;

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];

        if (i === parts.length - 1) {
          // if we are at end of the path, assign the value to the target
          // THIS UPDATE result, because reference
          target[part] = obj[key];
        } else {
          if (!target[part]) {
            const nextPart = parts[i + 1];
            if (/^\d+$/.test(nextPart)) {
              target[part] = [];
            } else {
              target[part] = {};
            }
          }
          target = target[part]; // add a new level to the target
        }
      }
    } else {
      result[key] = obj[key];
    }
  });

  return result;
}

export default restructureObject;
