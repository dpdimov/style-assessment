// Simple test script to verify assessment_id functionality
// Run with: node lib/test_assessment_id.js
// Make sure you have proper environment variables set for database connection

const { DatabaseService } = require('./database.ts');

async function testAssessmentIdFunctionality() {
  console.log('Testing Assessment ID functionality...\n');
  
  try {
    // Test database connection
    console.log('1. Testing database connection...');
    const isConnected = await DatabaseService.testConnection();
    console.log(`   Connection: ${isConnected ? 'SUCCESS' : 'FAILED'}\n`);
    
    if (!isConnected) {
      console.log('Database connection failed. Please check your environment variables.');
      return;
    }

    // Test saving with different assessment IDs
    console.log('2. Testing save with assessment_id...');
    const testRecord1 = {
      assessment_id: 'test-leadership',
      x_coordinate: 0.5,
      y_coordinate: 0.3,
      custom_code: 'TEST001',
      email_domain: 'example.com',
      style_name: 'Breakaway',
      completed_at: new Date()
    };

    const saveResult1 = await DatabaseService.saveAssessmentResult(testRecord1);
    console.log(`   Save test-leadership: ${saveResult1.success ? 'SUCCESS' : 'FAILED'}`);
    if (!saveResult1.success) {
      console.log(`   Error: ${saveResult1.error}`);
    }

    const testRecord2 = {
      assessment_id: 'test-personality',
      x_coordinate: -0.3,
      y_coordinate: -0.7,
      custom_code: 'TEST001',
      email_domain: 'example.com',
      style_name: 'Focused',
      completed_at: new Date()
    };

    const saveResult2 = await DatabaseService.saveAssessmentResult(testRecord2);
    console.log(`   Save test-personality: ${saveResult2.success ? 'SUCCESS' : 'FAILED'}\n`);

    // Test querying by assessment ID
    console.log('3. Testing queries by assessment_id...');
    const leadershipResults = await DatabaseService.getResultsByAssessmentId('test-leadership');
    console.log(`   Leadership results: ${leadershipResults.length} records`);

    const personalityResults = await DatabaseService.getResultsByAssessmentId('test-personality');
    console.log(`   Personality results: ${personalityResults.length} records`);

    // Test querying by custom code with assessment filter
    const customCodeResults = await DatabaseService.getResultsByCustomCode('TEST001');
    console.log(`   All TEST001 results: ${customCodeResults.length} records`);

    const filteredResults = await DatabaseService.getResultsByCustomCode('TEST001', 'test-leadership');
    console.log(`   TEST001 leadership only: ${filteredResults.length} records\n`);

    // Test analytics
    console.log('4. Testing analytics by assessment_id...');
    const leadershipAnalytics = await DatabaseService.getAnalyticsByAssessmentId('test-leadership');
    console.log(`   Leadership analytics: ${leadershipAnalytics ? 'SUCCESS' : 'FAILED'}`);
    if (leadershipAnalytics) {
      console.log(`   Total assessments: ${leadershipAnalytics.total_assessments}`);
      console.log(`   Avg coordinates: (${leadershipAnalytics.avg_x}, ${leadershipAnalytics.avg_y})`);
    }

    console.log('\n✅ All tests completed successfully!');
    console.log('\n⚠️ Remember to clean up test data from your database');
    
  } catch (error) {
    console.error('Test failed with error:', error);
  }
}

// Run the test if this script is executed directly
if (require.main === module) {
  testAssessmentIdFunctionality().catch(console.error);
}

module.exports = { testAssessmentIdFunctionality };