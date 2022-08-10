import { readFromStore } from '../storageHelper';

import { DOWNLOAD_TYPE } from './downloadType';
import { storageNameCreator } from './storageNameCreator';

// function to recognise whether the AR object is on the device when the download page is opened
export const checkDownloadedData = async ({ data, setData }) => {
  const checkedData = [...data];

  for (const [index, dataItem] of checkedData.entries()) {
    for (const objectItem of dataItem?.payload?.downloadableUris) {
      const { storageName } = storageNameCreator({ dataItem, objectItem });

      try {
        const downloadedItem = await readFromStore(storageName);

        if (downloadedItem?.payload?.localUris) {
          checkedData[index] = downloadedItem;
        } else {
          checkedData[index].payload.downloadType = DOWNLOAD_TYPE.DOWNLOADABLE;
          checkedData[index].payload.localUris = [];
          checkedData[index].payload.progress = 0;
          checkedData[index].payload.progressSize = 0;
          checkedData[index].payload.size = 0;
        }
      } catch (error) {
        console.error(error);
      }
    }
  }

  setData(checkedData);
};
