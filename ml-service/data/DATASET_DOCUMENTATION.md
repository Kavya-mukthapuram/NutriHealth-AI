# Nutritional Deficiency Dataset Documentation

## 1. Deficiency-Training Dataset

### NHANES 2021–2023

Source:
National Health and Nutrition Examination Survey (NHANES)

Purpose:
Used as the primary health and nutrition dataset for ML model development.

Contains:
- Demographic information
- Dietary nutrient intake
- Laboratory measurements
- Health and medical questionnaire variables

Participant identifier:
- SEQN

### Available biomarker information

Iron:
- LBXFER - Ferritin
- LBXTFR - Transferrin receptor
- LBXHGB - Hemoglobin
- LBXSIR - Serum iron

Vitamin D:
- LBXVIDMS - Serum vitamin D

Folate:
- LBDRFO - RBC folate

Calcium:
- LBXSCA - Serum calcium

Magnesium:
- LBXMAGN - Serum magnesium

## 2. Dietary/Nutrient Features

The processed dataset contains dietary intake features including:

- calories
- protein
- carbohydrates
- sugar
- fiber
- fat
- vitamin_b12
- folate
- vitamin_c
- vitamin_d
- calcium
- magnesium
- iron
- zinc
- vitamin_a
- vitamin_k

These variables represent dietary intake and should not automatically be interpreted as confirmed nutritional deficiencies.

## 3. Deficiency Labels

The NHANES dataset does not contain explicit columns such as:

- iron_deficient
- vitamin_d_deficient
- b12_deficient
- folate_deficient

Therefore, deficiency targets must be derived from appropriate laboratory biomarkers using documented thresholds.

## 4. Current Target Support

Strong biomarker support:
- Iron
- Vitamin D
- Folate

Limited biomarker support:
- Calcium
- Magnesium

Dietary-intake-only support in the current dataset:
- Vitamin B12
- Zinc
- Vitamin A
- Vitamin C
- Vitamin K

## 5. Dataset Limitations and Assumptions

1. NHANES does not provide ready-made deficiency labels for the selected variables.
2. Missing laboratory values are common because not every participant has every laboratory measurement.
3. Missing values must not automatically be treated as zero.
4. Dietary intake does not necessarily represent nutritional deficiency.
5. Deficiency labels must be created using scientifically documented criteria.
6. Iron deficiency should consider appropriate biomarkers and, where possible, inflammation-related information.
7. The current dataset does not provide sufficient biomarker evidence to claim confirmed deficiency for every nutrient.
8. The model should provide nutritional deficiency risk estimates rather than medical diagnoses.
9. Day 1 and Day 2 dietary intake values were averaged when available; if only one day was available, the available day contributes to the feature.