export const getTranslate = (row: number, col: number) =>
  `translate(${getTranslateValue(col)}, ${getTranslateValue(row)})`;

export const getTranslateValue = (rowOrCol: number) => rowOrCol * 30 + 5;
