# EDA Observations

## 1. Dataset Size
The processed NHANES dataset contains 11,933 participant records and 41 variables.

## 2. Missing Values
Several laboratory variables have substantial missing values.

Ferritin (LBXFER) and transferrin receptor (LBXTFR) have approximately 84% missing values.
Serum magnesium, calcium and serum iron have approximately 47% missing values.
Serum vitamin D has approximately 39% missing values.
RBC folate has approximately 37% missing values.
Hemoglobin has approximately 36% missing values.

Dietary nutrient variables have approximately 44% missing values.

These missing values should not automatically be replaced with zero because laboratory measurements may be unavailable due to NHANES examination or subsample eligibility.

## 3. Demographic Variables
Age ranges from approximately 0 to 80 years.
The dataset contains participants across children, adolescents, adults and older adults.

The gender variable contains two main coded categories.

## 4. Categorical Variables
NHANES categorical variables use numerical codes.
For example, many questionnaire variables use:
1 = Yes
2 = No

Special codes such as 7 and 9 may represent refused or don't know responses and must be handled during data cleaning.

## 5. Duplicate Records
No complete duplicate rows were detected.
No duplicate participant SEQN values were detected.

Therefore, duplicate participant records are not currently a concern.

## 6. Numerical Variables
Laboratory and dietary variables show different ranges and distributions.
Several nutrient intake variables are right-skewed, with some participants having substantially higher intake values.

## 7. Potential Outliers
The IQR method identified potential statistical outliers in several laboratory and dietary variables.

These values should not be removed automatically because an IQR outlier is not necessarily an invalid medical measurement.
Outliers will be investigated during data cleaning.

## 8. Deficiency Labels
The processed dataset does not contain explicit nutritional deficiency labels.

Therefore, deficiency targets must be derived only where scientifically appropriate from available biomarkers and documented thresholds.

Dietary nutrient intake alone should not be treated as confirmed nutritional deficiency.

## 9. Target Availability
Iron has several useful laboratory indicators, including ferritin, transferrin receptor, hemoglobin and serum iron.

Vitamin D has serum vitamin D measurements.

Folate has RBC folate measurements.

Vitamin B12, zinc, vitamin A, vitamin C and vitamin K currently have dietary intake information but no confirmed deficiency biomarker in the selected variables.

Therefore, these nutrients should not automatically be labeled as clinically deficient.

## 10. Overall EDA Conclusion
The dataset contains useful demographic, dietary and laboratory information for nutritional risk modeling.

However, substantial missingness, NHANES coded responses, statistical outliers and the absence of explicit deficiency labels must be carefully addressed during data cleaning and target-label construction.