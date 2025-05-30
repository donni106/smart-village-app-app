import _isEqual from 'lodash/isEqual';

import { ResourceFiltersActions } from '../reducers';

export const updateResourceFiltersStateHelper = ({
  query,
  queryVariables,
  resourceFiltersDispatch,
  resourceFiltersState
}: {
  query: string;
  queryVariables: Record<string, any>;
  resourceFiltersDispatch?: any;
  resourceFiltersState?: Record<string, any>;
}) => {
  const variables: Record<string, any> = { ...queryVariables };

  if (variables.end_date && variables.start_date) {
    variables.dateRange = [variables.start_date, variables.end_date];
  }

  if (
    typeof variables.saveable === 'boolean' &&
    variables.saveable &&
    !_isEqual(variables, resourceFiltersState?.[query])
  ) {
    resourceFiltersDispatch({
      type: ResourceFiltersActions.AddResourceFilter,
      payload: {
        key: query,
        value: { ...resourceFiltersState?.[query], ...variables }
      }
    });
  }

  if (
    typeof variables.saveable === 'boolean' &&
    !variables.saveable &&
    resourceFiltersState?.[query]
  ) {
    resourceFiltersDispatch({
      type: ResourceFiltersActions.RemoveResourceFilter,
      payload: query
    });
  }
};
