export function getSkillCoord(skillPosition) {
  // skillPosition is a string like 'A1'
  const x = skillPosition.charCodeAt(0) - 65;
  const y = parseInt(skillPosition.slice(1), 10) - 1;
  return { x, y };
}
