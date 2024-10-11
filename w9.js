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
        if (!nutritionData || !nutritionView) return;

        const meal = document.getElementById('mealSelect').value;
        const side = document.getElementById('sideSelect').value;
        const drink = document.getElementById('drinkSelect').value;

        const selections = [meal, side, drink].filter(item => item);
        
        if (selections.length === 0) {
            const defaultItem = nutritionData.find(item => item.name === "Big Mac") || nutritionData[0];
            await updateAllViews(defaultItem.name);
            return;
        }

        // Calculate combined nutrition values
        let totalCalories = 0;
        let totalSugar = 0;
        let totalSalt = 0;
        let totalFat = 0;
        let totalProtein = 0;
        let totalCarbs = 0;

        selections.forEach(itemName => {
            const itemData = nutritionData.find(d => d.name === itemName);
            if (itemData) {
                totalCalories += parseFloat(itemData.Calories || 0);
                totalSugar += parseFloat(itemData.Sugar || 0);
                totalSalt += parseFloat(itemData.Salt || 0);
                totalFat += parseFloat(itemData.Fat || 0);
                totalProtein += parseFloat(itemData.Protein || 0);
                totalCarbs += parseFloat(itemData.Carbohydrate || 0);
            }
        });

        const virtualFood = {
            name: selections.join(" + "),
            calories: totalCalories,
            sugar: totalSugar,
            salt: totalSalt,
            fat: totalFat,
            protein: totalProtein,
            carbohydrate: totalCarbs
        };

        await updateAllViews(virtualFood.name, virtualFood);
    }

    async function updateAllViews(foodName, customData = null) {
        const data = customData || nutritionData.find(item => item.name === foodName);
        if (!data) return;

        const viewUpdates = [
            nutritionView.signal("Food", foodName).runAsync(),
            sugarView.signal("Food", foodName).runAsync(),
            caloriesView.signal("Food", foodName).runAsync(),
            saltView.signal("Food", foodName).runAsync()
        ];

        // if (customData) {
        //     viewUpdates.push(
        //         nutritionView.data('nutrition', [data]).runAsync(),
        //         sugarView.data('nutrition', [data]).runAsync(),
        //         caloriesView.data('nutrition', [data]).runAsync(),
        //         saltView.data('nutrition', [data]).runAsync()
        //     );
        // }

        await Promise.all(viewUpdates);
    }

    async function initVisualizations() {
        try {
            const [treeSpec, nutritionSpec, sugar, calories, salt, nutrData] = await Promise.all([
                loadJSON('treemap.json'),
                loadJSON('w10.json'),
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

            const saltResult = await vegaEmbed('#sugar-container', sugar);
            saltView = saltResult.view;

            const sugarResult = await vegaEmbed('#salt-container', salt);
            sugarView = sugarResult.view;

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
      const mapSpec = await response.json();

      // Initialize the visualization
      const result = await vegaEmbed('#map', mapSpec);
      vegaView = result.view;

      // Add click listeners to timeline items
      const timelineItems = document.querySelectorAll('.timeline-item');
      timelineItems.forEach(item => {
          item.addEventListener('click', () => {
              const yearElement = item.querySelector('h2');
              if (yearElement) {
                  const year = yearElement.textContent;
                  updateMapPoint(year);
              }
          });
      });

  } catch (error) {
      console.error('Error initializing map:', error);
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