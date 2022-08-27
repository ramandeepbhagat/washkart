export const isEmpty = (inputValue) =>
  inputValue.trim() === "" ||
  inputValue.trim() === null ||
  inputValue.trim() === undefined;

export const localStorageSetItem = (key, val) => {
  localStorage.setItem(key, JSON.stringify(val));
};

export const localStorageGetItem = (key) => {
  const item = localStorage.getItem(key);
  return item ? JSON.parse(item) : null;
};
