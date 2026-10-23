const ML_API_URL = "https://nutrihealth-ai.onrender.com";

export interface PredictionInput {
  ridageyr: number;
  riagendr: number;
  ridreth3: number | null;
  dmdeduc2: number | null;
  indfmpir?: number | null;

  lbxmagn?: number | null;
  lbxsca?: number | null;

  mcq053?: number | null;
  mcq010?: number | null;
  agq030?: number | null;

  mcq160m?: number | null;
  mcq160l?: number | null;
  mcq160p?: number | null;
  mcq160a?: number | null;
  mcq160b?: number | null;
  mcq160c?: number | null;
  mcq160e?: number | null;
  mcq160f?: number | null;

  calories?: number | null;
  protein?: number | null;
  carbohydrates?: number | null;
  sugar?: number | null;
  fiber?: number | null;
  fat?: number | null;

  vitamin_b12?: number | null;
  folate?: number | null;
  vitamin_c?: number | null;
  vitamin_d?: number | null;
  calcium?: number | null;
  magnesium?: number | null;
  iron?: number | null;
  zinc?: number | null;
  vitamin_a?: number | null;
  vitamin_k?: number | null;
}

export interface DeficiencyResult {
  prediction: number;
  status: string;
  risk_score: number;
  important_factors: string[];
}

export interface PredictionResponse {
  success: boolean;
  message: string;
  results: {
    iron_deficiency: DeficiencyResult;
    vitamin_d_deficiency: DeficiencyResult;
    folate_deficiency: DeficiencyResult;
  };
  note: string;
}

export async function predictDeficiency(
  input: PredictionInput
): Promise<PredictionResponse> {
  const response = await fetch(
    `${ML_API_URL}/predict`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(input)
    }
  );

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `ML prediction failed: ${errorText}`
    );
  }

  return response.json();
}