import { formatSizeForAugmentedReality } from '../fileSizeHelper';

/**
 * display bytes downloaded per second in different formats
 *
 * @param {number} progressSize bytes downloaded per second
 * @param {number} totalSize total size of objects to be downloaded
 *
 * @return returns data of type `string` according to different states
 */
export const progressSizeGenerator = (progressSize, totalSize) => {
  if (!progressSize) {
    return formatSizeForAugmentedReality(totalSize);
  }

  return `${formatSizeForAugmentedReality(progressSize)} / ${formatSizeForAugmentedReality(
    totalSize
  )}`;
};
