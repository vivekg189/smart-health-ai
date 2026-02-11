import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  Paper,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Restaurant as RestaurantIcon,
  LocalDining as LocalDiningIcon,
  Favorite as FavoriteIcon,
  Warning as WarningIcon,
  Lightbulb as TipsIcon,
  Psychology as PsychologyIcon
} from '@mui/icons-material';

const PageContainer = styled(Container)(({ theme }) => ({
  minHeight: '100vh',
  paddingTop: theme.spacing(2),
  paddingBottom: theme.spacing(4),
}));

const HeaderSection = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  marginBottom: theme.spacing(4),
  padding: theme.spacing(3),
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  borderRadius: 16,
  color: 'white',
}));

const GradientTitle = styled(Typography)(({ theme }) => ({
  background: 'linear-gradient(45deg, #ffffff 30%, #e3f2fd 70%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  fontWeight: 'bold',
  marginBottom: theme.spacing(1),
}));

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 12,
  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  border: '1px solid rgba(0,0,0,0.05)',
}));

const GenerateButton = styled(Button)(({ theme }) => ({
  borderRadius: 8,
  padding: '10px 24px',
  fontSize: '1rem',
  fontWeight: 600,
  background: 'linear-gradient(45deg, #1a237e 30%, #4a148c 90%)',
  color: 'white',
  textTransform: 'none',
  '&:hover': {
    background: 'linear-gradient(45deg, #283593 30%, #6a1b9a 90%)',
  },
  '&:disabled': {
    background: '#ccc',
  }
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  color: '#1a237e',
  marginBottom: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

const MealCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(1.5),
  backgroundColor: '#f8f9ff',
  borderRadius: 8,
  border: '1px solid #e3f2fd',
}));

const Assistant = () => {
  const [formData, setFormData] = useState({
    age: '',
    gender: '',
    height: '',
    weight: '',
    bmi: '',
    foodPreference: '',
    diabetesRisk: '',
    heartDiseaseRisk: '',
    liverDiseaseRisk: '',
    bloodSugar: '',
    bloodPressure: '',
    cholesterol: '',
    // Optional health assessments
    includeDiabetes: false,
    includeHeart: false,
    includeLiver: false
  });

  const [mealPlan, setMealPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setApiKey('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');
  }, []);

  const handleInputChange = (field) => (event) => {
    const value = event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    if (field === 'height' || field === 'weight') {
      const height = field === 'height' ? parseFloat(value) : parseFloat(formData.height);
      const weight = field === 'weight' ? parseFloat(value) : parseFloat(formData.weight);
      
      if (height && weight && height > 0) {
        const bmi = (weight / ((height / 100) ** 2)).toFixed(1);
        setFormData(prev => ({ ...prev, bmi }));
      }
    }
  };

  const generateLLMPrompt = (userData) => {
    const { foodPreference, diabetesRisk, heartDiseaseRisk, liverDiseaseRisk, includeDiabetes, includeHeart, includeLiver } = userData;
    
    let healthRisks = [];
    if (includeDiabetes && diabetesRisk) healthRisks.push(`diabetes-${diabetesRisk}`);
    if (includeHeart && heartDiseaseRisk) healthRisks.push(`heart-${heartDiseaseRisk}`);
    if (includeLiver && liverDiseaseRisk) healthRisks.push(`liver-${liverDiseaseRisk}`);
    
    const healthRiskText = healthRisks.length > 0 ? healthRisks.join(', ') : 'general health';
    
    return `You must respond with ONLY valid JSON. Create a 7-day Indian ${foodPreference} meal plan for health considerations: ${healthRiskText}.

Response format (copy exactly):
{"days":[{"day":1,"breakfast":"Indian breakfast","lunch":"Indian lunch","dinner":"Indian dinner"},{"day":2,"breakfast":"Indian breakfast","lunch":"Indian lunch","dinner":"Indian dinner"},{"day":3,"breakfast":"Indian breakfast","lunch":"Indian lunch","dinner":"Indian dinner"},{"day":4,"breakfast":"Indian breakfast","lunch":"Indian lunch","dinner":"Indian dinner"},{"day":5,"breakfast":"Indian breakfast","lunch":"Indian lunch","dinner":"Indian dinner"},{"day":6,"breakfast":"Indian breakfast","lunch":"Indian lunch","dinner":"Indian dinner"},{"day":7,"breakfast":"Indian breakfast","lunch":"Indian lunch","dinner":"Indian dinner"}],"avoidFoods":["food1","food2"],"nutritionTips":["tip1","tip2"]}`;
  };

  const generateFallbackPlan = (userData) => {
    const { diabetesRisk, heartDiseaseRisk, liverDiseaseRisk, includeDiabetes, includeHeart, includeLiver } = userData;
    
    let activeRisks = [];
    if (includeDiabetes && diabetesRisk === 'high') activeRisks.push('diabetes');
    if (includeHeart && heartDiseaseRisk === 'high') activeRisks.push('heart');
    if (includeLiver && liverDiseaseRisk === 'high') activeRisks.push('liver');
    
    let mediumRisks = [];
    if (includeDiabetes && diabetesRisk === 'medium') mediumRisks.push('diabetes');
    if (includeHeart && heartDiseaseRisk === 'medium') mediumRisks.push('heart');
    if (includeLiver && liverDiseaseRisk === 'medium') mediumRisks.push('liver');
    
    const isHighRisk = activeRisks.length > 0;
    const isMediumRisk = mediumRisks.length > 0;
    
    if (isHighRisk) {
      return {
        days: [
          { day: 1, breakfast: "Steel-cut oats with cinnamon, Green tea", lunch: "Quinoa with steamed dal, boiled vegetables", dinner: "Multigrain roti with steamed palak, low-fat paneer" },
          { day: 2, breakfast: "Moong dal chilla (no oil), Herbal tea", lunch: "Brown rice with plain dal, steamed bhindi", dinner: "Chapati with boiled rajma (low salt), steamed broccoli" },
          { day: 3, breakfast: "Vegetable daliya with flax seeds", lunch: "Quinoa with arhar dal, steamed lauki", dinner: "Roti with plain dal, steamed spinach" },
          { day: 4, breakfast: "Steamed idli with sambar (low salt)", lunch: "Vegetable khichdi with low-fat curd", dinner: "Chapati with mixed dal (no tadka), steamed cabbage" },
          { day: 5, breakfast: "Oats dosa with vegetables", lunch: "Cauliflower rice with vegetables", dinner: "Roti with grilled paneer, steamed karela" },
          { day: 6, breakfast: "Ragi porridge with almonds (no jaggery)", lunch: "Multigrain roti with boiled chole", dinner: "Chapati with boiled chana, steamed beans" },
          { day: 7, breakfast: "Quinoa upma with herbs", lunch: "Quinoa with sambar (low salt)", dinner: "Quinoa with sambar, steamed okra" }
        ],
        avoidFoods: ["Fried foods", "High salt foods", "Sugar", "White rice", "Processed foods"],
        nutritionTips: ["Avoid salt and sugar", "Steam or boil foods", "Monitor blood pressure", "Drink plenty of water"]
      };
    } else if (isMediumRisk) {
      return {
        days: [
          { day: 1, breakfast: "Oats upma with vegetables, Green tea", lunch: "Brown rice with dal, mixed vegetables, cucumber raita", dinner: "Roti with palak paneer, small bowl of curd" },
          { day: 2, breakfast: "Poha with minimal oil, Buttermilk", lunch: "Quinoa pulao with vegetables, mint chutney", dinner: "Chapati with rajma, steamed broccoli" },
          { day: 3, breakfast: "Idli with sambar, coconut chutney", lunch: "Brown rice with moong dal, bhindi sabzi", dinner: "Roti with dal tadka, sauteed spinach" },
          { day: 4, breakfast: "Vegetable daliya, Green tea", lunch: "Khichdi with curd, roasted papad", dinner: "Chapati with mixed dal, steamed cabbage" },
          { day: 5, breakfast: "Besan chilla with mint chutney", lunch: "Brown rice with arhar dal, lauki sabzi", dinner: "Roti with paneer bhurji, sauteed karela" },
          { day: 6, breakfast: "Dosa with sambar, tomato chutney", lunch: "Vegetable biryani (brown rice), raita", dinner: "Chapati with chana masala, steamed beans" },
          { day: 7, breakfast: "Ragi porridge with nuts, jaggery", lunch: "Roti with chole, vegetable salad", dinner: "Brown rice with sambar, stir-fried okra" }
        ],
        avoidFoods: ["Deep-fried foods", "Excessive sweets", "High-fat dairy", "Processed snacks"],
        nutritionTips: ["Limit oil and sugar", "Choose whole grains", "Include fiber-rich foods", "Regular meal timing"]
      };
    } else {
      return {
        days: [
          { day: 1, breakfast: "Aloo paratha with curd, Chai", lunch: "Rice with dal, sabzi, pickle, papad", dinner: "Roti with chicken curry, vegetable" },
          { day: 2, breakfast: "Poha with peanuts, Buttermilk", lunch: "Biryani with raita, pickle", dinner: "Chapati with paneer makhani, dal" },
          { day: 3, breakfast: "Dosa with sambar, chutney", lunch: "Rice with fish curry, vegetables", dinner: "Roti with mutton curry, salad" },
          { day: 4, breakfast: "Upma with vegetables, Coffee", lunch: "Chole bhature with onions", dinner: "Chapati with egg curry, sabzi" },
          { day: 5, breakfast: "Paratha with pickle, Lassi", lunch: "Rice with rajma, vegetables", dinner: "Roti with chicken tikka, dal" },
          { day: 6, breakfast: "Idli vada with sambar", lunch: "Pulao with paneer curry", dinner: "Chapati with fish masala, vegetables" },
          { day: 7, breakfast: "Puri sabzi with halwa", lunch: "Rice with dal, mixed vegetables", dinner: "Roti with lamb curry, salad" }
        ],
        avoidFoods: ["Excessive junk food", "Too much sugar", "Overeating"],
        nutritionTips: ["Enjoy variety in meals", "Include seasonal fruits", "Stay active", "Moderate portions"]
      };
    }
  };

  const callLLMAPI = async (prompt) => {
    try {
      console.log('API Key:', apiKey);
      console.log('Prompt:', prompt);
      
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [{
            role: 'user',
            content: prompt
          }],
          max_tokens: 1000,
          temperature: 0.3
        })
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.log('Error response:', errorData);
        throw new Error(`API Error: ${response.status} - ${errorData.error?.message}`);
      }

      const data = await response.json();
      console.log('Success response:', data);
      
      const content = data.choices[0].message.content.trim();
      console.log('Raw content:', content);
      console.log('Content length:', content.length);
      console.log('First 100 chars:', content.substring(0, 100));
      console.log('Last 100 chars:', content.substring(content.length - 100));
      
      // Try to parse as direct JSON
      try {
        const parsed = JSON.parse(content);
        console.log('Direct parse SUCCESS');
        return parsed;
      } catch (parseError) {
        console.log('Direct parse failed:', parseError.message);
        
        // Look for JSON anywhere in the response
        const jsonStart = content.indexOf('{');
        const jsonEnd = content.lastIndexOf('}');
        
        console.log('JSON start position:', jsonStart);
        console.log('JSON end position:', jsonEnd);
        
        if (jsonStart !== -1 && jsonEnd !== -1) {
          const jsonStr = content.substring(jsonStart, jsonEnd + 1);
          console.log('Extracted JSON length:', jsonStr.length);
          console.log('Extracted JSON:', jsonStr);
          
          try {
            const parsed = JSON.parse(jsonStr);
            console.log('Extracted parse SUCCESS');
            return parsed;
          } catch (extractError) {
            console.log('Extracted parse failed:', extractError.message);
            throw new Error(`JSON parse failed: ${extractError.message}`);
          }
        } else {
          console.log('No JSON braces found in content');
          throw new Error('No JSON found in response');
        }
      }
    } catch (error) {
      console.error('Full error:', error);
      throw error;
    }
  };

  const generateMealPlan = async () => {
    setLoading(true);
    setError('');
    
    try {
      // First try to get AI-generated meal plan
      if (apiKey) {
        const prompt = generateLLMPrompt(formData);
        const aiMealPlan = await callLLMAPI(prompt);
        setMealPlan(aiMealPlan);
        setLoading(false);
        return;
      }
    } catch (error) {
      console.log('AI generation failed, falling back to predefined plan:', error.message);
      setError('AI service unavailable, using fallback meal plan');
    }
    
    // Fallback to predefined meal plan
    await new Promise(resolve => setTimeout(resolve, 1000));
    const personalizedMealPlan = generateFallbackPlan(formData);
    setMealPlan(personalizedMealPlan);
    setLoading(false);
  };

  const isFormValid = () => {
    const basicFieldsValid = formData.age && formData.gender && formData.height && 
           formData.weight && formData.foodPreference;
    
    // Check if at least one health assessment is selected and has a value
    const healthAssessmentValid = 
      (!formData.includeDiabetes || formData.diabetesRisk) &&
      (!formData.includeHeart || formData.heartDiseaseRisk) &&
      (!formData.includeLiver || formData.liverDiseaseRisk);
    
    return basicFieldsValid && healthAssessmentValid;
  };

  return (
    <PageContainer maxWidth="lg">
      <HeaderSection>
        <Box sx={{ textAlign: 'center' }}>
          <PsychologyIcon sx={{ fontSize: 48, mb: 1 }} />
          <GradientTitle variant="h3" component="h1">
            NutriMind AI
          </GradientTitle>
          <Typography variant="h6" sx={{ opacity: 0.9 }}>
            Personalized Indian meal plans powered by AI
          </Typography>
        </Box>
        {!apiKey && (
          <Alert severity="warning" sx={{ mt: 2, backgroundColor: 'rgba(255,255,255,0.1)', color: 'white' }}>
            <strong>API Key Required:</strong> Please configure your Groq API key for AI-powered meal planning.
          </Alert>
        )}
      </HeaderSection>

      <Grid container spacing={3} direction="column" alignItems="center">
        <Grid item xs={12} sx={{ width: '100%' }}>
          <Box sx={{ width: '100%' }}>
          <StyledCard>
            <CardContent sx={{ p: 3 }}>
              <SectionTitle variant="h6">
                <RestaurantIcon />
                Health Profile
              </SectionTitle>
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Age"
                    type="number"
                    value={formData.age}
                    onChange={handleInputChange('age')}
                    variant="outlined"
                    size="small"
                  />
                </Grid>
                <Grid item xs={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Gender</InputLabel>
                    <Select
                      value={formData.gender}
                      onChange={handleInputChange('gender')}
                      label="Gender"
                    >
                      <MenuItem value="male">Male</MenuItem>
                      <MenuItem value="female">Female</MenuItem>
                      <MenuItem value="other">Other</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Height (cm)"
                    type="number"
                    value={formData.height}
                    onChange={handleInputChange('height')}
                    variant="outlined"
                    size="small"
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Weight (kg)"
                    type="number"
                    value={formData.weight}
                    onChange={handleInputChange('weight')}
                    variant="outlined"
                    size="small"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="BMI"
                    value={formData.bmi}
                    variant="outlined"
                    size="small"
                    disabled
                    helperText="Auto-calculated"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Food Preference</InputLabel>
                    <Select
                      value={formData.foodPreference}
                      onChange={handleInputChange('foodPreference')}
                      label="Food Preference"
                    >
                      <MenuItem value="veg">Vegetarian</MenuItem>
                      <MenuItem value="non-veg">Non-Vegetarian</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              <SectionTitle variant="h6">
                <WarningIcon />
                Health Risk Assessment (Optional)
              </SectionTitle>
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.includeDiabetes}
                        onChange={(e) => setFormData(prev => ({ ...prev, includeDiabetes: e.target.checked, diabetesRisk: e.target.checked ? prev.diabetesRisk : '' }))}
                      />
                    }
                    label="Include Diabetes Risk Assessment"
                  />
                </Grid>
                {formData.includeDiabetes && (
                  <Grid item xs={12}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Diabetes Risk</InputLabel>
                      <Select
                        value={formData.diabetesRisk}
                        onChange={handleInputChange('diabetesRisk')}
                        label="Diabetes Risk"
                      >
                        <MenuItem value="low">Low</MenuItem>
                        <MenuItem value="medium">Medium</MenuItem>
                        <MenuItem value="high">High</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                )}
                
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.includeHeart}
                        onChange={(e) => setFormData(prev => ({ ...prev, includeHeart: e.target.checked, heartDiseaseRisk: e.target.checked ? prev.heartDiseaseRisk : '' }))}
                      />
                    }
                    label="Include Heart Disease Risk Assessment"
                  />
                </Grid>
                {formData.includeHeart && (
                  <Grid item xs={12}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Heart Disease Risk</InputLabel>
                      <Select
                        value={formData.heartDiseaseRisk}
                        onChange={handleInputChange('heartDiseaseRisk')}
                        label="Heart Disease Risk"
                      >
                        <MenuItem value="low">Low</MenuItem>
                        <MenuItem value="medium">Medium</MenuItem>
                        <MenuItem value="high">High</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                )}
                
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.includeLiver}
                        onChange={(e) => setFormData(prev => ({ ...prev, includeLiver: e.target.checked, liverDiseaseRisk: e.target.checked ? prev.liverDiseaseRisk : '' }))}
                      />
                    }
                    label="Include Liver Disease Risk Assessment"
                  />
                </Grid>
                {formData.includeLiver && (
                  <Grid item xs={12}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Liver Disease Risk</InputLabel>
                      <Select
                        value={formData.liverDiseaseRisk}
                        onChange={handleInputChange('liverDiseaseRisk')}
                        label="Liver Disease Risk"
                      >
                        <MenuItem value="low">Low</MenuItem>
                        <MenuItem value="medium">Medium</MenuItem>
                        <MenuItem value="high">High</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                )}
              </Grid>

              <Divider sx={{ my: 2 }} />

              <SectionTitle variant="h6">
                Medical Indicators (Optional)
              </SectionTitle>
              
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <TextField
                    fullWidth
                    label="Blood Sugar"
                    value={formData.bloodSugar}
                    onChange={handleInputChange('bloodSugar')}
                    variant="outlined"
                    size="small"
                    placeholder="mg/dL"
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    fullWidth
                    label="Blood Pressure"
                    value={formData.bloodPressure}
                    onChange={handleInputChange('bloodPressure')}
                    variant="outlined"
                    size="small"
                    placeholder="120/80"
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    fullWidth
                    label="Cholesterol"
                    value={formData.cholesterol}
                    onChange={handleInputChange('cholesterol')}
                    variant="outlined"
                    size="small"
                    placeholder="mg/dL"
                  />
                </Grid>
              </Grid>

              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error}
                </Alert>
              )}
              
              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <GenerateButton
                  onClick={generateMealPlan}
                  disabled={!isFormValid() || loading}
                  size="large"
                >
                  {loading ? 'Generating Plan...' : 'Generate Meal Plan'}
                </GenerateButton>
              </Box>
            </CardContent>
          </StyledCard>
          </Box>
        </Grid>

        <Grid item xs={12} sx={{ width: '100%' }}>
          {mealPlan ? (
            <Box>
              <StyledCard sx={{ mb: 2 }}>
                <CardContent sx={{ p: 3 }}>
                  <SectionTitle variant="h6">
                    <RestaurantIcon />
                    7-Day Personalized Meal Plan
                  </SectionTitle>
                  
                  {mealPlan.days.map((day) => (
                    <MealCard key={day.day}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, color: '#1a237e' }}>
                        Day {day.day}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 0.5 }}>
                        <strong>Breakfast:</strong> {day.breakfast}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 0.5 }}>
                        <strong>Lunch:</strong> {day.lunch}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Dinner:</strong> {day.dinner}
                      </Typography>
                    </MealCard>
                  ))}
                </CardContent>
              </StyledCard>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <StyledCard>
                    <CardContent sx={{ p: 2 }}>
                      <SectionTitle variant="h6" sx={{ mb: 1 }}>
                        <WarningIcon sx={{ color: '#f44336' }} />
                        Foods to Avoid
                      </SectionTitle>
                      
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {mealPlan.avoidFoods.map((food, index) => (
                          <Chip
                            key={index}
                            label={food}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: '0.75rem' }}
                          />
                        ))}
                      </Box>
                    </CardContent>
                  </StyledCard>
                </Grid>

                <Grid item xs={12} md={6}>
                  <StyledCard>
                    <CardContent sx={{ p: 2 }}>
                      <SectionTitle variant="h6" sx={{ mb: 1 }}>
                        <TipsIcon sx={{ color: '#4caf50' }} />
                        Nutrition Tips
                      </SectionTitle>
                      
                      <List dense sx={{ p: 0 }}>
                        {mealPlan.nutritionTips.slice(0, 4).map((tip, index) => (
                          <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                            <ListItemIcon sx={{ minWidth: 20 }}>
                              <FavoriteIcon sx={{ color: '#4caf50', fontSize: 14 }} />
                            </ListItemIcon>
                            <ListItemText 
                              primary={tip} 
                              primaryTypographyProps={{ fontSize: '0.85rem' }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </CardContent>
                  </StyledCard>
                </Grid>
              </Grid>
            </Box>
          ) : (
            <StyledCard>
              <CardContent sx={{ p: 4, textAlign: 'center' }}>
                <LocalDiningIcon sx={{ fontSize: 60, color: '#e0e0e0', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Your AI-Powered Meal Plan
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Fill out your health profile to generate a customized 7-day Indian meal plan 
                  using advanced AI based on your specific health conditions, BMI, age, and dietary preferences.
                </Typography>
                
                <Alert severity="info" sx={{ textAlign: 'left', fontSize: '0.85rem' }}>
                  <strong>Disclaimer:</strong> This AI nutrition assistant provides general Indian dietary guidance 
                  for preventive health purposes only using Groq's Llama model. It does not offer medical treatment or prescriptions. 
                  Please consult with healthcare professionals for medical advice.
                </Alert>
              </CardContent>
            </StyledCard>
          )}
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default Assistant;