import { jsPDF } from 'jspdf';

/* ===============================
   DISEASE CONFIGURATION
================================= */

const DISEASE_CONFIG = {
  diabetes: {
    title: 'Diabetes Risk Assessment',
    parameters: [
      { key: 'glucose', label: 'Glucose Level', unit: 'mg/dL' },
      { key: 'bmi', label: 'Body Mass Index', unit: '' },
      { key: 'blood_pressure', label: 'Blood Pressure', unit: 'mm Hg' },
      { key: 'age', label: 'Age', unit: 'years' }
    ],
    factors: {
      high: ['Elevated glucose levels', 'High BMI indicating obesity', 'Elevated blood pressure'],
      moderate: ['Borderline glucose levels', 'Slightly elevated BMI'],
      low: ['Normal glucose levels', 'Healthy BMI range']
    },
    recommendations: {
      high: ['Monitor glucose daily', 'Low-sugar diet', 'Exercise 30 minutes daily', 'Consult endocrinologist'],
      moderate: ['Reduce refined carbs', 'Increase physical activity'],
      low: ['Maintain balanced diet', 'Regular exercise']
    }
  },

  heart: {
    title: 'Cardiovascular Disease Risk Assessment',
    parameters: [
      { key: 'ap_hi', label: 'Systolic BP', unit: 'mm Hg' },
      { key: 'ap_lo', label: 'Diastolic BP', unit: 'mm Hg' },
      { key: 'cholesterol', label: 'Cholesterol', format: v => ['Normal', 'Above Normal', 'Well Above Normal'][v - 1] },
      { key: 'gluc', label: 'Glucose', format: v => ['Normal', 'Above Normal', 'Well Above Normal'][v - 1] }
    ],
    factors: {
      high: ['Elevated blood pressure', 'High cholesterol levels'],
      moderate: ['Borderline blood pressure'],
      low: ['Normal BP', 'Healthy cholesterol']
    },
    recommendations: {
      high: ['Consult cardiologist', 'Low-sodium diet', 'Quit smoking'],
      moderate: ['Exercise 150 min/week', 'Reduce salt'],
      low: ['Maintain heart-healthy lifestyle']
    }
  },

  liver: {
    title: 'Liver Function Assessment',
    parameters: [
      { key: 'Total_Bilirubin', label: 'Total Bilirubin', unit: 'mg/dL' },
      { key: 'Alamine_Aminotransferase', label: 'ALT', unit: 'IU/L' },
      { key: 'Aspartate_Aminotransferase', label: 'AST', unit: 'IU/L' }
    ],
    factors: {
      disease: ['Elevated liver enzymes', 'Abnormal bilirubin levels'],
      normal: ['Normal enzyme levels']
    },
    recommendations: {
      disease: ['Consult hepatologist', 'Avoid alcohol completely'],
      normal: ['Maintain liver-friendly diet']
    }
  },

  kidney: {
    title: 'Kidney Function Assessment',
    parameters: [
      { key: 'blood_urea', label: 'Blood Urea', unit: 'mg/dL' },
      { key: 'serum_creatinine', label: 'Serum Creatinine', unit: 'mg/dL' }
    ],
    factors: {
      high: ['Elevated creatinine levels'],
      moderate: ['Borderline kidney markers'],
      low: ['Normal kidney function']
    },
    recommendations: {
      high: ['Consult nephrologist', 'Low-protein diet'],
      moderate: ['Quarterly checkups'],
      low: ['Maintain hydration']
    }
  },

  bone: {
    title: 'Bone Fracture Detection',
    parameters: [
      { key: 'confidence', label: 'Detection Confidence', unit: '%' }
    ],
    factors: {
      fracture: ['Fracture detected', 'Bone discontinuity observed'],
      normal: ['No fracture detected']
    },
    recommendations: {
      fracture: ['Consult orthopedic surgeon', 'Immobilize affected area'],
      normal: ['Maintain bone health', 'Adequate calcium intake']
    }
  }
};

/* ===============================
   FETCH PATIENT DATA FROM DB
================================= */

const fetchPatientData = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/user/profile', {
      credentials: 'include'
    });
    if (response.ok) {
      const data = await response.json();
      return {
        name: data.name || data.username,
        age: data.age,
        gender: data.gender
      };
    }
  } catch (e) {}
  return {};
};

/* ===============================
   MEAL PLANS BY DISEASE
================================= */

const MEAL_PLANS = {
  diabetes: {
    high: [
      'Breakfast: Oatmeal with berries, unsweetened',
      'Lunch: Grilled chicken salad, whole grain bread',
      'Dinner: Baked fish, steamed vegetables, quinoa',
      'Snacks: Nuts, Greek yogurt (unsweetened)'
    ],
    moderate: [
      'Breakfast: Whole grain toast with avocado',
      'Lunch: Vegetable soup, brown rice',
      'Dinner: Lean protein with mixed vegetables'
    ],
    low: [
      'Maintain balanced meals with complex carbs',
      'Include fiber-rich foods and lean proteins'
    ]
  },
  heart: {
    high: [
      'Breakfast: Oatmeal with walnuts',
      'Lunch: Salmon, leafy greens, olive oil',
      'Dinner: Grilled chicken, steamed broccoli',
      'Avoid: Saturated fats, excess sodium'
    ],
    moderate: [
      'Mediterranean diet with fish 2x/week',
      'Limit red meat, increase vegetables'
    ],
    low: [
      'Continue heart-healthy diet',
      'Omega-3 rich foods, whole grains'
    ]
  },
  liver: {
    disease: [
      'Breakfast: Fresh fruits, whole grains',
      'Lunch: Lean protein, green vegetables',
      'Dinner: Steamed fish, brown rice',
      'Avoid: Alcohol, fried foods, processed foods'
    ],
    normal: [
      'Balanced diet with antioxidant-rich foods',
      'Limit alcohol and processed foods'
    ]
  },
  kidney: {
    high: [
      'Low-sodium, low-protein diet',
      'Limit potassium and phosphorus',
      'Consult dietitian for renal diet plan'
    ],
    moderate: [
      'Moderate protein intake',
      'Stay hydrated, limit sodium'
    ],
    low: [
      'Balanced diet with adequate hydration',
      'Monitor protein intake'
    ]
  },
  bone: {
    fracture: [
      'High calcium: Milk, yogurt, cheese',
      'Vitamin D: Fortified foods, sunlight',
      'Protein: Lean meats, legumes'
    ],
    normal: [
      'Calcium-rich foods daily',
      'Vitamin D supplementation if needed'
    ]
  }
};

/* ===============================
   MAIN REPORT FUNCTION
================================= */

export const generateMedicalReport = async (
  diseaseType,
  formData,
  result,
  patientInfo = {}
) => {

  // Fetch patient data from database
  const dbPatient = await fetchPatientData();
  const finalPatientInfo = { ...dbPatient, ...patientInfo };

  const doc = new jsPDF();
  const config = DISEASE_CONFIG[diseaseType];

  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 20;
  let yPos = 20;

  const medicalGreen = [34, 139, 94];
  const darkGray = [60, 60, 60];
  const lightGray = [180, 180, 180];

  /* ===== HEADER SECTION ===== */
  
  // Logo (top-left)
  try {
    const logoImg = await loadImage('/logo.png');
    doc.addImage(logoImg, 'PNG', margin, yPos, 22, 22);
  } catch (e) {}

  // HealthAI Title (beside logo)
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkGray);
  doc.text('HealthAI', margin + 28, yPos + 9);

  // Subtitle
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(120, 120, 120);
  doc.text('Smart Healthcare System', margin + 28, yPos + 15);

  // Top-right: Date & Report ID
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  const reportDate = new Date().toLocaleDateString();
  const reportId = `RPT-${Date.now().toString(36).toUpperCase()}`;
  doc.text(`Date: ${reportDate}`, pageWidth - margin, yPos + 6, { align: 'right' });
  doc.text(`ID: ${reportId}`, pageWidth - margin, yPos + 12, { align: 'right' });

  yPos += 28;

  // Horizontal divider with green accent
  doc.setDrawColor(...lightGray);
  doc.setLineWidth(0.5);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  
  doc.setDrawColor(...medicalGreen);
  doc.setLineWidth(2);
  doc.line(margin, yPos + 1, margin + 40, yPos + 1);

  yPos += 10;

  // Report Title (centered)
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text(`AI-Assisted ${config.title} Report`, pageWidth / 2, yPos, { align: 'center' });

  yPos += 10;
  doc.setDrawColor(...lightGray);
  doc.setLineWidth(0.3);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 10;

  /* ===== Patient Info ===== */
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('PATIENT INFORMATION', margin, yPos);
  yPos += 6;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');

  const name = finalPatientInfo.name || 'Not Provided';
  const age = formData.age || formData.Age || finalPatientInfo.age || 'Not Provided';
  const gender = formData.gender ? (formData.gender === '1' ? 'Female' : 'Male') :
                 formData.Gender ? (formData.Gender === '0' ? 'Female' : 'Male') :
                 finalPatientInfo.gender || 'Not Provided';

  doc.text(`Name: ${name}`, margin + 5, yPos);
  doc.text(`Age: ${age}`, margin + 75, yPos);
  doc.text(`Gender: ${gender}`, margin + 125, yPos);
  yPos += 12;

  /* ===== Clinical Parameters ===== */
  doc.setFont('helvetica', 'bold');
  doc.text('KEY CLINICAL PARAMETERS', margin, yPos);
  yPos += 6;

  doc.setFont('helvetica', 'normal');
  config.parameters.forEach(param => {
    if (formData[param.key] !== undefined) {
      const value = param.format ? param.format(formData[param.key]) : formData[param.key];
      doc.text(`${param.label}: ${value}${param.unit ? ' ' + param.unit : ''}`, margin + 5, yPos);
      yPos += 5;
    }
  });

  yPos += 10;

  /* ===== Risk Logic ===== */
  let riskCategory = 'low';

  if (diseaseType === 'bone') {
    riskCategory = result.prediction === 1 ? 'fracture' : 'normal';
  } else if (diseaseType === 'liver') {
    riskCategory = result.prediction === 1 ? 'disease' : 'normal';
  } else {
    riskCategory = result.prediction === 1 ? 'high' : 'low';
  }

  const probability = result.probability
    ? (result.probability * 100).toFixed(1)
    : result.confidence
    ? (result.confidence * 100).toFixed(1)
    : 'N/A';

  let boxColor = [40, 167, 69];
  if (['high', 'disease', 'fracture'].includes(riskCategory)) {
    boxColor = [178, 34, 34];
  }

  /* ===== Risk Box ===== */
  doc.setFillColor(...boxColor);
  doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 18, 2, 2, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('RISK ASSESSMENT', margin + 5, yPos + 7);

  doc.setFontSize(10);
  doc.text(`Assessment: ${riskCategory.toUpperCase()}`, margin + 5, yPos + 14);
  doc.text(`Confidence: ${probability}%`, pageWidth - margin - 5, yPos + 14, { align: 'right' });

  yPos += 26;
  doc.setTextColor(0, 0, 0);

  /* ===== Factors ===== */
  doc.setFont('helvetica', 'bold');
  doc.text('KEY CONTRIBUTING FACTORS', margin, yPos);
  yPos += 6;

  doc.setFont('helvetica', 'normal');
  const factors = config.factors[riskCategory] || [];
  factors.slice(0, 3).forEach(f => {
    doc.text(`• ${f}`, margin + 5, yPos);
    yPos += 5;
  });

  yPos += 8;

  /* ===== Recommendations ===== */
  doc.setFont('helvetica', 'bold');
  doc.text('PERSONALIZED RECOMMENDATIONS', margin, yPos);
  yPos += 6;

  doc.setFont('helvetica', 'normal');
  const recs = config.recommendations[riskCategory] || [];
  recs.slice(0, 4).forEach(r => {
    doc.text(`• ${r}`, margin + 5, yPos);
    yPos += 5;
  });

  yPos += 8;

  /* ===== Meal Plan ===== */
  const mealPlan = MEAL_PLANS[diseaseType]?.[riskCategory] || [];
  if (mealPlan.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.text('RECOMMENDED MEAL PLAN', margin, yPos);
    yPos += 6;

    doc.setFont('helvetica', 'normal');
    mealPlan.forEach(meal => {
      const lines = doc.splitTextToSize(`• ${meal}`, pageWidth - 2 * margin - 10);
      lines.forEach(line => {
        if (yPos > pageHeight - 45) return;
        doc.text(line, margin + 5, yPos);
        yPos += 5;
      });
    });
  }

  /* ===== Footer ===== */
  doc.setDrawColor(...lightGray);
  doc.line(margin, pageHeight - 28, pageWidth - margin, pageHeight - 28);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(110, 110, 110);
  doc.text(
    'This report provides AI-assisted screening only and does not replace professional medical diagnosis.',
    pageWidth / 2,
    pageHeight - 20,
    { align: 'center', maxWidth: pageWidth - 40 }
  );

  doc.setFont('helvetica', 'normal');
  doc.text('Generated by HealthAI System v1.0', pageWidth / 2, pageHeight - 14, { align: 'center' });

  doc.save(`HealthAI_${config.title.replace(/\s+/g, '_')}_${reportId}.pdf`);
};

/* ===============================
   IMAGE LOADER
================================= */

const loadImage = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
};
