import { resolveNaturalDateRange } from '../ai-agent/tools/resolveNaturalDateRange.js';

async function testDateResolution() {
    const testPhrases = [
      // Date ranges
      "this month",
      "last week", 
      "this quarter",
      "last year",
      "January 2024",
      "Q1 2024",
      "last 3 months",
      "past 30 days",
      
      // Single dates (handled by the same tool now)
      "yesterday",
      "today", 
      "last Friday",
      "March 15th",
      "next Monday",
      
      // Additional test cases
      "beginning of this year",
      "end of last quarter",
      "next 2 weeks",
      "first week of December",
      "last day of February 2024"
    ];
  
    console.log("🧪 Testing Natural Date Resolution (unified tool):");
    console.log("=" .repeat(60));
    
    for (const phrase of testPhrases) {
      try {
        const result = await resolveNaturalDateRange.func(phrase);
        const parsed = JSON.parse(result);
        
        if (parsed.error) {
          console.log(`❌ "${phrase}" → ERROR: ${parsed.error}`);
        } else {
          const isSingleDate = parsed.startDate === parsed.endDate;
          const dateType = isSingleDate ? "(single date)" : "(date range)";
          console.log(`✅ "${phrase}" ${dateType} → ${parsed.parsedRange}`);
        }
      } catch (err) {
        console.log(`❌ "${phrase}" → PARSE ERROR: ${err.message}`);
      }
    }
    
    console.log("\n" + "=" .repeat(60));
    console.log("✨ Date resolution testing complete!");
}

// Run the tests
testDateResolution().catch(err => {
    console.error("❌ Error during date resolution tests:", err);
});