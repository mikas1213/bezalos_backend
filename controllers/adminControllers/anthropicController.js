const { Anthropic } = require('@anthropic-ai/sdk');

const anthropic = new Anthropic({
    apiKey: process.env.CLAUDE_BE_ZALOS_KEY
});

exports.anthropicApi = async (req, res) => {
    try {
        // const { height, weight, age, goals, allergies } = req.body;
        const height = 175;
        const weight = 73;
        const age = 41;
        const goals = 'Svorio metimas';
        const allergies = 'Alergija cukrui';

        const response = await anthropic.messages.create({
            model: "claude-3-7-sonnet-20250219",
            // model: "claude-3-5-haiku-20241022",
            max_tokens: 1000,
            temperature: 0.7,
            messages: [
                {
                role: 'user',
                content: `Sukurk 7 dienų mitybos planą ${age} metų asmeniui. Ūgis: ${height} cm, svoris: ${weight} kg. Tikslas: ${goals}. Alergijos: ${allergies}.`}
            ]
        });
        res.json({ mealPlan: response.content[0].text });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}