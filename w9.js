var vg_1 = "w9.json";
vegaEmbed("#map", vg_1).then(function(result){
}).catch(console.error);

var vg_2 = "revenue.json";
vegaEmbed("#area", vg_2).then(function(result){
}).catch(console.error);

document.addEventListener('DOMContentLoaded', function() {
  let treeView, nutritionView, sugarView, caloriesView, saltView;
  let nutritionData = null;

  async function loadJSON(url) {
      const response = await fetch(url);
      return response.json();
  }

  async function loadNutritionData() {
      const response = await fetch('https://raw.githubusercontent.com/tay1203/DV2/refs/heads/main/menu.json');
      return response.json();
  }

  async function updateNutritionChart() {
    if (!nutritionData || !nutritionView || !combinedNutritionView || !combinedSaltView) return;
  
    const meal = document.getElementById('mealSelect').value;
    const side = document.getElementById('sideSelect').value;
    const drink = document.getElementById('drinkSelect').value;
  
    const mealItem = nutritionData.find(item => item.name === meal);
    const sideItem = nutritionData.find(item => item.name === side);
    const drinkItem = nutritionData.find(item => item.name === drink);

    // Default image URLs
    const defaultImage = 'https://github.com/tay1203/DV2/blob/main/images/logo.png?raw=true';

    // Display meal image
    const mealImgElement = document.getElementById('mealImage');
    if (mealItem && mealItem.imageURL) {
        mealImgElement.src = mealItem.imageURL;
        mealImgElement.style.display = 'block';
    } else {
        mealImgElement.src = defaultImage; // Show default meal image if none selected
        mealImgElement.style.display = 'block';
    }

    // Display side image
    const sideImgElement = document.getElementById('sideImage');
    if (sideItem && sideItem.imageURL) {
        sideImgElement.src = sideItem.imageURL;
        sideImgElement.style.display = 'block';
    } else {
        sideImgElement.src = defaultImage; // Show default side image if none selected
        sideImgElement.style.display = 'block';
    }

    // Display drink image
    const drinkImgElement = document.getElementById('drinkImage');
    if (drinkItem && drinkItem.imageURL) {
        drinkImgElement.src = drinkItem.imageURL;
        drinkImgElement.style.display = 'block';
    } else {
        drinkImgElement.src = defaultImage; // Show default drink image if none selected
        drinkImgElement.style.display = 'block';
    }


    // Check if all dropdowns are empty or set to "None"
    const selections = [meal, side, drink].filter(item => item && item !== "");
    // Check if all dropdowns are set to "None"
    if (!meal && !side && !drink) {
      // Set to zero values for nutrition when all are "None"
  
        // No selections made, show default view
        document.getElementById('nutrition-container').style.display = 'block';
        document.getElementById('salt-container').style.display = 'block';
        document.getElementById('calories-container').style.display = 'block';
        document.getElementById('sugar-container').style.display = 'block';
        document.getElementById('combined-container').style.display = 'none';
        document.getElementById('combined-calories-container').style.display = 'none';
        document.getElementById('combined-salt-container').style.display = 'none';
        document.getElementById('combined-sugar-container').style.display = 'none';

        nutritionView.signal("Food", "None").run();
        caloriesView.signal("Food", "None").run();
        sugarView.signal("Food", "None").run();
        saltView.signal("Food", "None").run();

        return;  // Exit the function early
    }
  
    // Calculate combined nutrition values
    let totalCalories = 0, totalSugar = 0, totalSalt = 0, totalFat = 0, totalProtein = 0, totalCarbs = 0;
  
    selections.forEach(itemName => {
      const itemData = nutritionData.find(d => d.name === itemName);
      if (itemData) {
        totalCalories += parseFloat(itemData.Energy || 0);
        totalSugar += parseFloat(itemData.Sugar || 0);
        totalSalt += parseFloat(itemData.Salt || 0);
        totalFat += parseFloat(itemData.Fat || 0);
        totalProtein += parseFloat(itemData.Protein || 0);
        totalCarbs += parseFloat(itemData.Carbohydrate || 0);
      }
    });
  
    const combinedData = [
      {nutrient: "Calories (kcal)", value: totalCalories},
      {nutrient: "Salt (g)", value: totalSalt},
      {nutrient: "Sugar (g)", value: totalSugar},
      {nutrient: "Fat (g)", value: totalFat},
      {nutrient: "Protein (g)", value: totalProtein},
      {nutrient: "Carbohydrate (g)", value: totalCarbs}
    ];
  
    // Update the appropriate view based on the number of selections
    if (selections.length === 1) {
      // Single selection: show nutrition-container and salt-container, hide combined containers
      document.getElementById('nutrition-container').style.display = 'block';
      document.getElementById('salt-container').style.display = 'block';
      document.getElementById('calories-container').style.display = 'block';
      document.getElementById('sugar-container').style.display = 'block';
      document.getElementById('combined-container').style.display = 'none';
      document.getElementById('combined-calories-container').style.display = 'none';
      document.getElementById('combined-salt-container').style.display = 'none';
      document.getElementById('combined-sugar-container').style.display = 'none';
      
      nutritionView.signal("Food", selections[0]).run();
      caloriesView.signal("Food", selections[0]).run();
      sugarView.signal("Food", selections[0]).run();
      saltView.signal("Food", selections[0]).run();

    } else if (selections.length > 1) {
      // Multiple selections: hide nutrition-container and salt-container, show combined containers
      document.getElementById('nutrition-container').style.display = 'none';
      document.getElementById('salt-container').style.display = 'none';
      document.getElementById('calories-container').style.display = 'none';
      document.getElementById('sugar-container').style.display = 'none';
      document.getElementById('combined-container').style.display = 'block';
      document.getElementById('combined-calories-container').style.display = 'block';
      document.getElementById('combined-salt-container').style.display = 'block';
      document.getElementById('combined-sugar-container').style.display = 'block';
      
      combinedNutritionView.data('nutrition', combinedData).run();
      combinedCaloriesView.data('nutrition', [combinedData[0]]).run();
      combinedSaltView.data('nutrition', [combinedData[1]]).run();
      combinedSugarView.data('nutrition', [combinedData[2]]).run();
    }
  
  }

  async function initVisualizations() {
      try {
          const [treeSpec, nutritionSpec, sugar, calories, salt, nutrData] = await Promise.all([
              loadJSON('treemap.json'),
              loadJSON('w10.json'), // Use the new combined meal chart spec
              loadJSON('sugar.json'),
              loadJSON('calories.json'),
              loadJSON('salt.json'),
              loadNutritionData()
          ]);

          nutritionData = nutrData;

          const treeResult = await vegaEmbed('#tree-container', treeSpec);
          treeView = treeResult.view;

          const nutritionResult = await vegaEmbed('#nutrition-container', nutritionSpec, {
              data: { nutrition: nutritionData }
          });
          nutritionView = nutritionResult.view;

          const caloriesResult = await vegaEmbed('#calories-container', calories);
          caloriesView = caloriesResult.view;

          const saltResult = await vegaEmbed('#salt-container', salt);
          saltView = saltResult.view;

          const sugarResult = await vegaEmbed('#sugar-container', sugar);
          sugarView = sugarResult.view;

          const combinedNutritionSpec = await loadJSON('combined.json');
          const combinedNutritionResult = await vegaEmbed('#combined-container', combinedNutritionSpec);
          combinedNutritionView = combinedNutritionResult.view;

          const combinedCaloriesSpec = await loadJSON('combinedcalories.json');
          const combinedCaloriesResult = await vegaEmbed('#combined-calories-container', combinedCaloriesSpec);
          combinedCaloriesView = combinedCaloriesResult.view;

          const combinedSaltSpec = await loadJSON('combinedsalt.json');
          const combinedSaltResult = await vegaEmbed('#combined-salt-container', combinedSaltSpec);
          combinedSaltView = combinedSaltResult.view;

          const combinedSugarSpec = await loadJSON('combinedsugar.json');
          const combinedSugarResult = await vegaEmbed('#combined-sugar-container', combinedSugarSpec);
          combinedSugarView = combinedSugarResult.view;

          populateDropdowns(nutritionData);

          treeView.addSignalListener('Food', async function(name, value) {
              if (value) {
                  const selectedItem = nutritionData.find(item => item.name === value);
                  if (selectedItem) {
                      // Reset all dropdowns first
                      document.getElementById('mealSelect').value = "";
                      document.getElementById('sideSelect').value = "";
                      document.getElementById('drinkSelect').value = "";

                      // Set the appropriate dropdown based on the Type
                      if (selectedItem.Type) {
                          if (selectedItem.Type.includes('A La Carte')) {
                              document.getElementById('mealSelect').value = value;
                          } else if (selectedItem.Type.includes('Sides')) {
                              document.getElementById('sideSelect').value = value;
                          } else if (selectedItem.Type.includes('Beverages')) {
                              document.getElementById('drinkSelect').value = value;
                          }
                      }
                      updateNutritionChart();
                  }
              }
          });

          document.getElementById('mealSelect').addEventListener('change', updateNutritionChart);
          document.getElementById('sideSelect').addEventListener('change', updateNutritionChart);
          document.getElementById('drinkSelect').addEventListener('change', updateNutritionChart);

          // Initial update
          updateNutritionChart();
          

      } catch (error) {
          console.error('Error loading visualizations:', error);
      }
    }

    function populateDropdowns(data) {
        const mealSelect = document.getElementById('mealSelect');
        const sideSelect = document.getElementById('sideSelect');
        const drinkSelect = document.getElementById('drinkSelect');

        mealSelect.innerHTML = '<option value="">None</option>';
        sideSelect.innerHTML = '<option value="">None</option>';
        drinkSelect.innerHTML = '<option value="">None</option>';


        const categories = {
            meals: data.filter(item => item.Type && item.Type.includes('A La Carte')),
            sides: data.filter(item => item.Type && item.Type.includes('Sides')),
            drinks: data.filter(item => item.Type && item.Type.includes('Beverages'))
        };

        categories.meals.forEach(item => {
            const option = new Option(item.name, item.name);
            mealSelect.add(option);
        });

        categories.sides.forEach(item => {
            const option = new Option(item.name, item.name);
            sideSelect.add(option);
        });

        categories.drinks.forEach(item => {
            const option = new Option(item.name, item.name);
            drinkSelect.add(option);
        });

        // Set the default to "Big Mac" for the meal
        mealSelect.value = "Big Mac";
    }

    initVisualizations();
    

});

document.addEventListener('DOMContentLoaded', () => {
    const timeline = document.getElementById('timeline');
    const items = document.querySelectorAll('.timeline-item');
    
    const options = {
        root: timeline,
        rootMargin: '0px',
        threshold: 0.5
    };
    
    const handleIntersection = (entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.remove('fade-out');
                entry.target.classList.add('fade-in');
            } else {
                entry.target.classList.remove('fade-in');
                entry.target.classList.add('fade-out');
            }
        });
    };
    
    const observer = new IntersectionObserver(handleIntersection, options);
    items.forEach(item => observer.observe(item));
});

// Timeline event coordinates data
const timelineEvents = {
  "1940": { lat: 34.1083, lng: -117.2898, description: "First McDonald's in San Bernardino, California" },
  "1953": { lat: 33.4484, lng: -112.0740, description: "First franchise in Phoenix, Arizona" },
  "1955": { lat: 42.0334, lng: -87.8834, description: "Ray Kroc's first franchise in Des Plaines, Illinois" },
  "1967": { lat: 49.2827, lng: -123.1207, description: "First international restaurant in British Columbia" },
  "1971": { lat: 31.5455, lng: -110.2773, description: "First drive-thru in Sierra Vista, Arizona" },
  "1982": { lat: 3.1478, lng: 101.7137, description: "First Malaysian restaurant in Bukit Bintang" },
  "1990": { lat: 55.7558, lng: 37.6173, description: "First Soviet Union restaurant in Moscow" }
};

let vegaView;

// Function to initialize the map
async function initializeMap() {
  try {
      // Fetch the map configuration
      const response = await fetch('w9.json');
      const response2 = await fetch('revenue.json');
      const mapSpec = await response.json();
      const revenueSpec = await response2.json();

      // Initialize the visualization
      const result = await vegaEmbed('#map', mapSpec);
      vegaView = result.view;
      const result2 = await vegaEmbed('#area', revenueSpec);
      revenueView = result2.view;

      // Add click listeners to timeline items
      const timelineItems = document.querySelectorAll('.timeline-item');
      timelineItems.forEach(item => {
          item.addEventListener('click', () => {
              const yearElement = item.querySelector('h2');
              if (yearElement) {
                  const year = yearElement.textContent;
                  updateMapPoint(year);
                  updateRevenueView(year);
              }
          });
      });

  } catch (error) {
      console.error('Error initializing viz:', error);
  }
}

// Function to update the point on the map
function updateMapPoint(year) {
  const event = timelineEvents[year];
  if (!event) return;

  // Update the points layer with new data
  const pointData = [{
      lat: event.lat,
      lng: event.lng,
      description: event.description
  }];

  // Update the view with new point data
  vegaView.data('pointData', pointData);
  vegaView.run();
}

// Initialize the map when the document is loaded
document.addEventListener('DOMContentLoaded', initializeMap);

// Add visual feedback for timeline item clicks
document.addEventListener('DOMContentLoaded', () => {
  const timelineItems = document.querySelectorAll('.timeline-item');
  
  timelineItems.forEach(item => {
      item.addEventListener('click', () => {
          // Remove active class from all items
          timelineItems.forEach(i => i.classList.remove('active'));
          // Add active class to clicked item
          item.classList.add('active');
      });
  });
});
