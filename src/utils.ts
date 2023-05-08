/**
 *
 * @param arr an array
 * @returns The value of all elements of the array, false in case of different values
 */
export const valueOfUniformArray = (arr: any[]) => {
  const set = new Set(arr);
  if (set.size === 1 && arr[0]) {
    return arr[0];
  }
  return false;
};
