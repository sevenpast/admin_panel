// Test script for equipment API
const testEquipmentCreation = async () => {
  const testData = {
    name: "Test Board",
    base_name: "Test Board",
    category: "surfboard",
    type: "Beginner",
    brand: "Test Brand",
    size: "8'0",
    condition: "good",
    status: "available",
    description: "Test equipment",
    quantity: 2,
    notes: "Test notes",
    numbering_type: "numeric",
    numbering_start: 1
  };

  try {
    console.log('Testing equipment creation...');
    console.log('Data:', testData);
    
    const response = await fetch('http://localhost:3000/api/equipment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });

    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const error = await response.json();
      console.error('Error:', error);
      return;
    }

    const result = await response.json();
    console.log('Success! Created equipment:', result);
    
  } catch (error) {
    console.error('Network error:', error);
  }
};

// Run the test
testEquipmentCreation();



