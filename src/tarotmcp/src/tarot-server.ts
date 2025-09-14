import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { TarotCardManager } from "./tarot/card-manager.js";
import { TarotReadingManager } from "./tarot/reading-manager.js";
import { TarotSessionManager } from "./tarot/session-manager.js";
import { TarotCardSearch } from "./tarot/card-search.js";
import { TarotCardAnalytics } from "./tarot/card-analytics.js";

/**
 * Main class for the Tarot MCP Server functionality.
 * Use the static `create()` method to instantiate.
 */
export class TarotServer {
  private cardManager: TarotCardManager;
  private readingManager: TarotReadingManager;
  private sessionManager: TarotSessionManager;
  private cardSearch: TarotCardSearch;
  private cardAnalytics: TarotCardAnalytics;

  /**
   * The constructor is private. Use the static async `create()` method.
   */
  private constructor(cardManager: TarotCardManager) {
    this.cardManager = cardManager;
    this.sessionManager = new TarotSessionManager();
    this.readingManager = new TarotReadingManager(this.cardManager, this.sessionManager);
    this.cardSearch = new TarotCardSearch(this.cardManager.getAllCards());
    this.cardAnalytics = new TarotCardAnalytics(this.cardManager.getAllCards());
  }

  /**
   * Asynchronously creates and initializes a TarotServer instance.
   */
  public static async create(): Promise<TarotServer> {
    const cardManager = await TarotCardManager.create();
    return new TarotServer(cardManager);
  }

  /**
   * Returns all available tools for the Tarot MCP Server
   */
  public getAvailableTools(): Tool[] {
    return [
      {
        name: "get_card_info",
        description: "Get detailed information about a specific tarot card from the Rider-Waite deck",
        inputSchema: {
          type: "object",
          properties: {
            cardName: {
              type: "string",
              description: "The name of the tarot card (e.g., 'The Fool', 'Two of Cups')",
            },
            orientation: {
              type: "string",
              enum: ["upright", "reversed"],
              description: "The orientation of the card (upright or reversed)",
              default: "upright",
            },
          },
          required: ["cardName"],
        },
      },
      {
        name: "list_all_cards",
        description: "List all available tarot cards in the Rider-Waite deck",
        inputSchema: {
          type: "object",
          properties: {
            category: {
              type: "string",
              enum: ["all", "major_arcana", "minor_arcana", "wands", "cups", "swords", "pentacles"],
              description: "Filter cards by category",
              default: "all",
            },
          },
        },
      },
      {
        name: "perform_reading",
        description: "Perform a tarot card reading using a specific spread",
        inputSchema: {
          type: "object",
          properties: {
            spreadType: {
              type: "string",
              enum: ["single_card", "three_card", "celtic_cross", "horseshoe", "relationship_cross", "career_path", "decision_making", "spiritual_guidance", "year_ahead", "chakra_alignment", "shadow_work", "venus_love", "tree_of_life", "astrological_houses", "mandala", "pentagram", "mirror_of_truth"],
              description: "The type of tarot spread to perform",
            },
            question: {
              type: "string",
              description: "The question or focus for the reading",
            },
            sessionId: {
              type: "string",
              description: "Optional session ID to continue a previous reading",
            },
          },
          required: ["spreadType", "question"],
        },
      },
      {
        name: "search_cards",
        description: "Search for tarot cards using various criteria like keywords, suit, element, etc.",
        inputSchema: {
          type: "object",
          properties: {
            keyword: {
              type: "string",
              description: "Search keyword to find in card meanings, keywords, or symbolism",
            },
            suit: {
              type: "string",
              enum: ["wands", "cups", "swords", "pentacles"],
              description: "Filter by card suit",
            },
            arcana: {
              type: "string",
              enum: ["major", "minor"],
              description: "Filter by arcana type",
            },
            element: {
              type: "string",
              enum: ["fire", "water", "air", "earth"],
              description: "Filter by element",
            },
            number: {
              type: "number",
              description: "Filter by card number",
            },
            orientation: {
              type: "string",
              enum: ["upright", "reversed"],
              description: "Search in upright or reversed meanings",
            },
            limit: {
              type: "number",
              description: "Maximum number of results to return (default: 10)",
            },
          },
        },
      },
      {
        name: "find_similar_cards",
        description: "Find cards with similar meanings to a given card",
        inputSchema: {
          type: "object",
          properties: {
            cardName: {
              type: "string",
              description: "The name of the card to find similar cards for",
            },
            limit: {
              type: "number",
              description: "Maximum number of similar cards to return (default: 5)",
            },
          },
          required: ["cardName"],
        },
      },
      {
        name: "get_database_analytics",
        description: "Get comprehensive analytics and statistics about the tarot card database",
        inputSchema: {
          type: "object",
          properties: {
            includeRecommendations: {
              type: "boolean",
              description: "Whether to include improvement recommendations (default: true)",
            },
          },
        },
      },
      {
        name: "get_random_cards",
        description: "Get random cards with optional filtering",
        inputSchema: {
          type: "object",
          properties: {
            count: {
              type: "number",
              description: "Number of random cards to draw (default: 1)",
            },
            suit: {
              type: "string",
              enum: ["wands", "cups", "swords", "pentacles"],
              description: "Filter by card suit",
            },
            arcana: {
              type: "string",
              enum: ["major", "minor"],
              description: "Filter by arcana type",
            },
            element: {
              type: "string",
              enum: ["fire", "water", "air", "earth"],
              description: "Filter by element",
            },
          },
        },
      },
      {
        name: "create_custom_spread",
        description: "Create a custom tarot spread and draw cards for it. Use this when no existing spread fits your needs and you want to create your own layout with specific positions and meanings.",
        inputSchema: {
          type: "object",
          properties: {
            spreadName: {
              type: "string",
              description: "Name for your custom spread",
            },
            description: {
              type: "string",
              description: "Description of what this spread is designed to explore",
            },
            positions: {
              type: "array",
              description: "Array of position objects defining each card position in the spread",
              items: {
                type: "object",
                properties: {
                  name: {
                    type: "string",
                    description: "Name of this position (e.g., 'Past Influences', 'Current Challenge')",
                  },
                  meaning: {
                    type: "string",
                    description: "What this position represents in the reading",
                  },
                },
                required: ["name", "meaning"],
              },
              minItems: 1,
              maxItems: 15,
            },
            question: {
              type: "string",
              description: "The question or focus for this reading",
            },
            sessionId: {
              type: "string",
              description: "Optional session ID to continue a previous reading",
            },
          },
          required: ["spreadName", "description", "positions", "question"],
        },
      },
    ];
  }

  /**
   * Executes a specific tool with the provided arguments
   */
  public async executeTool(toolName: string, args: Record<string, any>): Promise<string> {
    switch (toolName) {
      case "get_card_info":
        return this.cardManager.getCardInfo(args.cardName, args.orientation || "upright");

      case "list_all_cards":
        return this.cardManager.listAllCards(args.category || "all");

      case "perform_reading":
        return this.readingManager.performReading(
          args.spreadType,
          args.question,
          args.sessionId
        );

      case "search_cards":
        return this.handleSearchCards(args);

      case "find_similar_cards":
        return this.handleFindSimilarCards(args);

      case "get_database_analytics":
        return this.handleGetAnalytics(args);

      case "get_random_cards":
        return this.handleGetRandomCards(args);

      case "create_custom_spread":
        return this.handleCreateCustomSpread(args);

      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
  }

  /**
   * Handle card search requests
   */
  private handleSearchCards(args: Record<string, any>): string {
    const searchOptions = {
      keyword: args.keyword,
      suit: args.suit,
      arcana: args.arcana,
      element: args.element,
      number: args.number,
      orientation: args.orientation || 'upright'
    };

    const results = this.cardSearch.search(searchOptions);
    const limit = args.limit || 10;
    const limitedResults = results.slice(0, limit);

    if (limitedResults.length === 0) {
      return "No cards found matching your search criteria.";
    }

    let response = `Found ${results.length} cards matching your search`;
    if (results.length > limit) {
      response += ` (showing top ${limit})`;
    }
    response += ":\n\n";

    for (const result of limitedResults) {
      response += `**${result.card.name}** (Relevance: ${result.relevanceScore})\n`;
      response += `- Suit: ${result.card.suit || 'N/A'} | Element: ${result.card.element || 'N/A'}\n`;
      response += `- Matched fields: ${result.matchedFields.join(', ')}\n`;
      response += `- Keywords: ${result.card.keywords.upright.slice(0, 3).join(', ')}\n\n`;
    }

    return response;
  }

  /**
   * Handle finding similar cards
   */
  private handleFindSimilarCards(args: Record<string, any>): string {
    const cardName = args.cardName;
    const limit = args.limit || 5;

    // First find the card ID
    const targetCard = this.cardManager.getAllCards().find(
      card => card.name.toLowerCase() === cardName.toLowerCase()
    );

    if (!targetCard) {
      return `Card "${cardName}" not found. Please check the card name and try again.`;
    }

    const similarCards = this.cardSearch.findSimilarCards(targetCard.id, limit);

    if (similarCards.length === 0) {
      return `No similar cards found for "${cardName}".`;
    }

    let response = `Cards similar to **${targetCard.name}**:\n\n`;

    for (const card of similarCards) {
      response += `**${card.name}**\n`;
      response += `- Suit: ${card.suit || 'N/A'} | Element: ${card.element || 'N/A'}\n`;
      response += `- Keywords: ${card.keywords.upright.slice(0, 3).join(', ')}\n`;
      response += `- General meaning: ${card.meanings.upright.general.substring(0, 100)}...\n\n`;
    }

    return response;
  }

  /**
   * Handle database analytics requests
   */
  private handleGetAnalytics(args: Record<string, any>): string {
    const includeRecommendations = args.includeRecommendations !== false;
    const analytics = this.cardAnalytics.generateReport();

    let response = "# 🔮 Tarot Database Analytics Report\n\n";

    // Overview
    response += "## 📊 Database Overview\n";
    response += `- **Total Cards**: ${analytics.overview.totalCards}\n`;
    response += `- **Completion Rate**: ${analytics.overview.completionRate.toFixed(1)}%\n`;
    response += `- **Major Arcana**: ${analytics.overview.arcanaDistribution.major || 0} cards\n`;
    response += `- **Minor Arcana**: ${analytics.overview.arcanaDistribution.minor || 0} cards\n\n`;

    // Suits distribution
    response += "### Suits Distribution\n";
    for (const [suit, count] of Object.entries(analytics.overview.suitDistribution)) {
      response += `- **${suit.charAt(0).toUpperCase() + suit.slice(1)}**: ${count} cards\n`;
    }
    response += "\n";

    // Elements distribution
    response += "### Elements Distribution\n";
    for (const [element, count] of Object.entries(analytics.overview.elementDistribution)) {
      response += `- **${element.charAt(0).toUpperCase() + element.slice(1)}**: ${count} cards\n`;
    }
    response += "\n";

    // Data Quality
    response += "## 🔍 Data Quality\n";
    response += `- **Complete Cards**: ${analytics.dataQuality.completeCards}/${analytics.overview.totalCards}\n`;
    response += `- **Average Keywords per Card**: ${analytics.dataQuality.averageKeywordsPerCard.toFixed(1)}\n`;
    response += `- **Average Symbols per Card**: ${analytics.dataQuality.averageSymbolsPerCard.toFixed(1)}\n`;

    if (analytics.dataQuality.incompleteCards.length > 0) {
      response += `- **Incomplete Cards**: ${analytics.dataQuality.incompleteCards.join(', ')}\n`;
    }
    response += "\n";

    // Content Analysis
    response += "## 📈 Content Analysis\n";
    response += "### Most Common Keywords\n";
    for (const keyword of analytics.contentAnalysis.mostCommonKeywords.slice(0, 10)) {
      response += `- **${keyword.keyword}**: ${keyword.count} times (${keyword.percentage.toFixed(1)}%)\n`;
    }
    response += "\n";

    // Recommendations
    if (includeRecommendations && analytics.recommendations.length > 0) {
      response += "## 💡 Recommendations\n";
      for (const recommendation of analytics.recommendations) {
        response += `- ${recommendation}\n`;
      }
      response += "\n";
    }

    return response;
  }

  /**
   * Handle random card requests
   */
  private handleGetRandomCards(args: Record<string, any>): string {
    const count = args.count || 1;
    const options = {
      suit: args.suit,
      arcana: args.arcana,
      element: args.element
    };

    const randomCards = this.cardSearch.getRandomCards(count, options);

    if (randomCards.length === 0) {
      return "No cards found matching your criteria.";
    }

    let response = count === 1 ? "🎴 Random Card:\n\n" : `🎴 ${randomCards.length} Random Cards:\n\n`;

    for (const card of randomCards) {
      response += `**${card.name}**\n`;
      response += `- Suit: ${card.suit || 'N/A'} | Element: ${card.element || 'N/A'}\n`;
      response += `- Keywords: ${card.keywords.upright.join(', ')}\n`;
      response += `- General meaning: ${card.meanings.upright.general}\n\n`;
    }

    return response;
  }

  /**
   * Handle custom spread creation and reading
   */
  private handleCreateCustomSpread(args: Record<string, any>): string {
    const { spreadName, description, positions, question, sessionId } = args;

    // Validate input
    if (!spreadName || typeof spreadName !== 'string') {
      return "Error: spreadName is required and must be a string.";
    }

    if (!description || typeof description !== 'string') {
      return "Error: description is required and must be a string.";
    }

    if (!Array.isArray(positions) || positions.length === 0) {
      return "Error: positions must be a non-empty array.";
    }

    if (positions.length > 15) {
      return "Error: Maximum 15 positions allowed for a custom spread.";
    }

    if (!question || typeof question !== 'string') {
      return "Error: question is required and must be a string.";
    }

    // Validate each position
    for (let i = 0; i < positions.length; i++) {
      const position = positions[i];
      if (!position || typeof position !== 'object') {
        return `Error: Position ${i + 1} must be an object with 'name' and 'meaning' properties.`;
      }
      if (!position.name || typeof position.name !== 'string') {
        return `Error: Position ${i + 1} must have a 'name' property that is a string.`;
      }
      if (!position.meaning || typeof position.meaning !== 'string') {
        return `Error: Position ${i + 1} must have a 'meaning' property that is a string.`;
      }
    }

    try {
      return this.readingManager.performCustomReading(
        spreadName,
        description,
        positions,
        question,
        sessionId
      );
    } catch (error) {
      return `Error creating custom spread: ${error instanceof Error ? error.message : String(error)}`;
    }
  }
}