import { consts, texts } from '../config';
import { QUERY_TYPES } from '../queries';

const { ROOT_ROUTE_NAMES } = consts;

/**
 * Determines the root route name for data based on its query.
 */
export const rootRouteName = (query: string) =>
  ({
    [QUERY_TYPES.EVENT_RECORD]: ROOT_ROUTE_NAMES.EVENT_RECORDS,
    [QUERY_TYPES.NEWS_ITEM]: ROOT_ROUTE_NAMES.NEWS_ITEMS,
    [QUERY_TYPES.POINT_OF_INTEREST]: ROOT_ROUTE_NAMES.POINTS_OF_INTEREST_AND_TOURS,
    [QUERY_TYPES.TOUR]: ROOT_ROUTE_NAMES.POINTS_OF_INTEREST_AND_TOURS
  }[query]);

// eslint-disable-next-line complexity
export const getTitleForQuery = (query: string, volunteer?: any) => {
  switch (query) {
    case QUERY_TYPES.NEWS_ITEMS:
      return texts.homeCategoriesNews.categoryTitle;
    case QUERY_TYPES.POINTS_OF_INTEREST:
      return texts.categoryTitles.pointsOfInterest;
    case QUERY_TYPES.TOURS:
      return texts.categoryTitles.tours;
    case QUERY_TYPES.EVENT_RECORDS:
      return texts.homeTitles.events;
    case QUERY_TYPES.VOLUNTEER.GROUP:
      return texts.detailTitles.volunteer.group;
    case QUERY_TYPES.VOLUNTEER.CALENDAR:
      return texts.detailTitles.volunteer.eventRecord;
    case QUERY_TYPES.VOLUNTEER.TASKS:
      return texts.detailTitles.volunteer.task;
    case QUERY_TYPES.VOLUNTEER.CONVERSATION:
      return volunteer?.title;
    case QUERY_TYPES.VOLUNTEER.ADDITIONAL:
      return texts.detailTitles.volunteer.additional;
    case QUERY_TYPES.VOLUNTEER.PROFILE:
      return volunteer?.title;
    case QUERY_TYPES.VOLUNTEER.USER:
      return texts.detailTitles.volunteer.user;
    case QUERY_TYPES.CONSUL.DEBATES:
    case QUERY_TYPES.CONSUL.PUBLIC_DEBATES:
      return texts.detailTitles.consul.debate;
    case QUERY_TYPES.CONSUL.PROPOSALS:
    case QUERY_TYPES.CONSUL.PUBLIC_PROPOSALS:
      return texts.detailTitles.consul.proposal;
    case QUERY_TYPES.CONSUL.POLLS:
      return texts.detailTitles.consul.poll;
    case QUERY_TYPES.CONSUL.PUBLIC_COMMENTS:
      return texts.detailTitles.consul.comment;
    default:
      return query;
  }
};
