import i18next from 'i18next';
import { SKILLS_DATA } from '../../../resources/constants/responseSkillsData.js';
import { getImageUrl } from '../../utils/files.js';

function parseSkillData(skillData, t) {
  return skillData.map(category => ({
    key: category.key,
    skills: Object.entries(category.skills).reduce((acc, [key, value]) => {
      acc[key] = {
        item: {
          ...value.item,
          name: t(value.item.name),
          image: getImageUrl(value.item.image),
          ...(value.item.tooltipText && { tooltipText: t(value.item.tooltipText) })
        },
        ...(value.variant && {
          variant: {
            ...value.variant,
            name: t(value.variant.name),
            image: getImageUrl(value.variant.image)
          }
        })
      };
      return acc;
    }, {}),
    links: category.links
  }));
}

export function getSkillsData(userLanguage) {
  const t = (text) => i18next.t(`skills:${text}`, { lng: userLanguage });
  return parseSkillData(SKILLS_DATA, t);
}


export default getSkillsData;
