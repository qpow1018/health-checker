export type TFoodFormItem = {
  id: number;
  name: string;
  amount: string;
};

export type TFoodFormValue = {
  recordedOn: string;
  recordedAt: string;
  source: string;
  foods: TFoodFormItem[];
};
