// Test Tavily Web Search API
// Run: node test-tavily-api.js

const TAVILY_API_KEY = process.env.TAVILY_API_KEY || 'YOUR_API_KEY_HERE';

async function testTavilySearch() {
  console.log('🔍 Testing Tavily Web Search API...\n');
  console.log('Query: "India hot news today"\n');
  
  try {
    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: TAVILY_API_KEY,
        query: 'India hot news today December 2024',
        max_results: 5,
        include_answer: true
      })
    });
    
    const data = await response.json();
    
    if (data.error) {
      console.log('❌ ERROR:', data.error);
      return;
    }
    
    console.log('✅ Tavily API is WORKING!\n');
    
    if (data.answer) {
      console.log('📝 SUMMARY:');
      console.log(data.answer);
      console.log('\n' + '='.repeat(60) + '\n');
    }
    
    if (data.results && data.results.length > 0) {
      console.log('📰 TOP NEWS SOURCES:\n');
      data.results.forEach((result, index) => {
        console.log(`${index + 1}. ${result.title}`);
        console.log(`   ${result.content?.substring(0, 150)}...`);
        console.log(`   🔗 ${result.url}\n`);
      });
    }
    
    console.log(`\n✅ Found ${data.results?.length || 0} results`);
    
  } catch (error) {
    console.log('❌ FAILED:', error.message);
  }
}

testTavilySearch();
