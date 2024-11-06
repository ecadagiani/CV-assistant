import i18next from 'i18next';
import TIMELINE_DATA from '../../../resources/constants/responseTimelineData.js';
import { getImageUrl } from '../../utils/files.js';

export const EVENT_CATEGORY = {
  SCHOOL: 'school',
  COMPANY: 'company',
  PROJECT: 'project',
  FREELANCE: 'freelance',
  TEACHING: 'teaching',
  REWARD: 'reward',
};

// {
//   id: String
//   entityCompany: COMPANY_ENTITY.<ValueCompany>.value (optional)
//   start: Date
//   end: Date?
//   timelinePosition: int
//   categories: [EVENT_CATEGORY]
//   color: String?
//   title: String
//   titleLine: String?
//   icon: String(url)
//   iconAlt: String
//   summarizedText: String?
//   text: String
//   projectLink: String(url)?
//   withSkillsDetails: boolean?
//   withEventDetail: boolean?
//   skills: [{
//     id: String
//     name: String
//     icon: String(url)
//     iconOutlined: String(url)?
//     text: String?
//     usageRatio: float?
//     color: String?
//   }],
//  captures: [String(url)]
//  capturesOptions: {
//    width: number?
//  }
// }

export function getTimelineData(userLanguage) {
  function t(text) {
    return i18next.t(`timeline:${text}`, { lng: userLanguage });
  }
  function tSkills(text) {
    return i18next.t(`skills:${text}`, { lng: userLanguage });
  }

  return {
    params: TIMELINE_DATA.params,
    events: TIMELINE_DATA.events.map((event) => {
      return {
        ...event,
        title: t(event.title),
        titleLine: event.titleLine ? t(event.titleLine) : undefined,
        text: t(event.text),
        summarizedText: event.summarizedText ? t(event.summarizedText) : undefined,
        icon: event.icon ? getImageUrl(event.icon) : undefined,
        iconAlt: event.iconAlt ? t(event.iconAlt) : undefined,
        skills: event?.skills?.map((skill) => ({
          ...skill,
          name: tSkills(skill.name),
          text: skill.text ? t(skill.text) : undefined,
          icon: getImageUrl(skill.icon),
          iconOutlined: skill.iconOutlined ? getImageUrl(skill.iconOutlined) : undefined,
        })),
        captures: event?.captures?.map((capture) => getImageUrl(capture)),
      };
    }),
  };
}

function getTimelineMessage(userLanguage, categories = []) {
  const timelineData = getTimelineData(userLanguage);
  if (categories.length > 0) {
    timelineData.events = timelineData.events.filter((event) => (
      event.categories.some((category) => categories.includes(category))
    ));
  }
  return timelineData;
}

export default getTimelineMessage;
