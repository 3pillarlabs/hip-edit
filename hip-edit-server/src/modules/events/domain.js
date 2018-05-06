/**
* @flow
* Represents an event that is propagated to all active code sessions.
*/
export default class EditorEvent {
  sessionToken: string;

  /**
  * Instantiates the Event object with sane defaults.
  * @constructor
  * @param {string} sessionToken - the SHA or UID of the active session
  */
  constructor(sessionToken: string) {
    this.sessionToken = sessionToken;
  }
}
