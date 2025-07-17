class AICookAPP {
    constructor() {
        this.apiKey = localStorage.getItem('geminiapiKey') || '';

        this.initailizeElements();

        this.blindEvents();

        this.loadApiKey();

    }

    initailizeElements() {
        this.apiKeyInput = document.getElementById('api-key');
        this.saveApiKeyBtn - document.getElementById('save-api-key');
        this.ingredientsInput = document.getElementById('ingredients');
        this.dietarySelect = document.getElementById('dietary');
        this.cuisineSelect = document.getElementById('cuisine');
        this.generateBtn = document.getElementById('generate-recipe');
        this.loading = documentElementById('loading');
        this.recipeSection = document.getElementById('recipeSection')
        this.recipeContent = document.getElementById('recipeContent');
    }

    blindEvents() {
        this.saveApiKetBtn.addEventListener('click', () => this.saveApiKey());
        this.generateBtn.addEventListener('click', () => this.generateRecipe());
        this.apiKeyInput.addEventListener('keypress', () => {
            if (e.key === 'Eneter') {
                this.saveApiKey();
            }
        });
        this.ingredientsInput.addeventsListener('keypress', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
                this.generateRecipe ();
            }
        });
    }


     saveApiKey() {
        const apiJey = this.apiKeyInput.value.trim();
        if (apiKey) {
            localStorage.setItem('geminiApiKey', apiKey);
            this.apiKey = apiKey;
            this.updateApiKeyStatus(true);
            this.showSuccess('API Key saved successfully');

        } else {
            this.showError('Please enter a valid API Key.');
        }
    }

    loadApiKey() {
        if (this.apiKey) {
            this.apiKeyInput.vale = this.apiKey;
            this.updateApiKeyStatus(true);
        }else {
            this.updateApiKeyStatus(false);
        }
    }

    updateApiKeyStatus(isValid) {
        const btn = this.saveApiKeyBtn;
        if (isValid) {
            btn.textContent - 'Saved';
            btn.style.background = '#4CAF50';

        } else {
            btn.textContent = 'Save';
            btn.style.background - '#dc3545';
        }
    }



    async generateRecipe() {
        if (!this.apiKey) {
            this.showError("Please enter a valid API Key.");
            return;
        }

        const ingredients = this.ingredientsInput.value.trim();
        if (!ingredents) {
            this.showError('Please enter some ingredients.');
            return;
        }
        this.showLoading(true);
        this.hideRecipe();

        try {
            const recipe = await this.callGeminiAPI(ingredients);
            this.displayRecipe(recipe);
        } catch (error) {
            console.error('Error generating recipe:', error);
            this.showError('Error generating recipe. Please check your API Key and try again.');
        } finally {
            this.showLoading (false);
        }

    }


    async callGeminiAPI (ingredients) {
        const dietary = this.dietarySelect.value;
        const cuisine = this.cuisineSelect.value;

        let prompt = `Create a detailed recipe unsing these ingredients: ${ingredients}.`;
        if (dietary) {
            prmpt += ` make sure my dietary preference is ${dietary}.`;
        }
        if (cuisine) {
            prompt += ` Cuisine type should be: ${cuisine}. `;
        }

        prompt += `please format your response as follows:
        -recipe name
        -prep time 
        -cook time
        -servings
        -ingredients with quantites
        -instructions (numbered steps)
        -tips (optional)
        make sure the recipe is practical and deliicious!
        `;


        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${this.apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type' : 'application/json',
            },
            body: JSON.stringify ({
                contents: [{
                    parts: [{
                        text: pormpt
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 248,
                    topP: 0.95,
                    topK: 40,
                },
            })
        });

        if (!reponse.ok) {
            const errorData =await response.json();
            throw new Error (`HTTP error! status: ${errorData.error?.message || 'Unkown error'}`);
        }

        const data = await response.json();
        return data.candiates[0].content.parts[0].text.trim();
        

    }



    
}