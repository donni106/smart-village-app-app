export const editSetting = (color) => `
  <?xml version="1.0" encoding="UTF-8"?>
  <svg width="16px" height="16px" viewBox="0 0 16 16" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <path d="M8 10.5C9.38071 10.5 10.5 9.38071 10.5 8C10.5 6.61929 9.38071 5.5 8 5.5C6.61929 5.5 5.5 6.61929 5.5 8C5.5 9.38071 6.61929 10.5 8 10.5Z" stroke="${color}" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M15.5 9V7L13.323 6.637C13.192 6.125 12.991 5.643 12.728 5.2L14.011 3.404L12.596 1.99L10.8 3.272C10.357 3.009 9.875 2.808 9.363 2.677L9 0.5H7L6.637 2.677C6.125 2.808 5.643 3.009 5.2 3.272L3.404 1.99L1.99 3.404L3.272 5.2C3.009 5.643 2.808 6.125 2.677 6.637L0.5 7V9L2.677 9.363C2.808 9.875 3.009 10.357 3.272 10.8L1.99 12.596L3.404 14.01L5.2 12.728C5.643 12.991 6.125 13.192 6.637 13.323L7 15.5H9L9.363 13.323C9.875 13.192 10.357 12.991 10.8 12.728L12.596 14.011L14.01 12.597L12.728 10.8C12.991 10.357 13.192 9.875 13.323 9.363L15.5 9Z" stroke="${color}" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
`;
