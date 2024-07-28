const { namespaceWrapper } = require('@_koii/namespace-wrapper');

class Audit {
  /**
   * Validates the submission value based on the email sent.
   *
   * @param {string} submission_value - The submission value to be validated, e.g., the email ID or a confirmation string
   * @param {number} round - The current round number
   * @returns {Promise<boolean>} The validation result, return true if the submission is correct, false otherwise
   */
  async validateNode(submission_value, round) {
    console.log('Started Audit', new Date(), process.env.TEST_KEYWORD);
    let vote;
    console.log('SUBMISSION VALUE', submission_value, round);

    try {
      // Assuming the submission_value is expected to be a confirmation message or email ID
      // For example, it could be something like 'Email sent: <message-id>'
      if (submission_value && submission_value.startsWith('Email sent: ')) {
        // Additional checks can be implemented here, e.g., verifying the format or checking against known values
        vote = true;
      } else {
        vote = false;
      }
    } catch (e) {
      console.error(e);
      vote = false;
    }
    return vote;
  }

  /**
   * Audits the submission value by your logic
   *
   * @param {number} roundNumber - The current round number
   * @returns {void}
   */
  async auditTask(roundNumber) {
    console.log('AUDIT CALLED IN ROUND', roundNumber);
    console.log('CURRENT SLOT IN AUDIT', await namespaceWrapper.getSlot());
    await namespaceWrapper.validateAndVoteOnNodes(this.validateNode.bind(this), roundNumber);
  }
}

const audit = new Audit();
module.exports = { audit };