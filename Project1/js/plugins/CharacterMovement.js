/*:
* @plugindesc Allow for player movement to cycle between 3 character sheets: idle, walk and run.
* @author FBU <andrefcasimiro@gmail.com>
*
* // Right now, we cant use arrays in the plugin params, so if you wish to support more than an actor
* // Copy and paste the following template.
*
* // INSTRUCTIONS:
* // Actor_{ID} - ID must be a number
* // Pose_Character_Sheet_{ID} - ID must be a string or a symbol.
*
* @param Actor_1
* @param Idle_Character_Sheet_Actor1
* @desc "The character set for idle movement"
* @require 1
* @dir img/characters/
* @type file
* @parent Actor_1
*
* @param Walking_Character_Sheet_Actor1
* @desc "The character set for walk movement"
* @require 1
* @dir img/characters/
* @type file
* @parent Actor_1
*
* @param Running_Character_Sheet_Actor1
* @desc "The character set for running movement"
* @require 1
* @dir img/characters/
* @type file
* @parent Actor_1
*/

(function() {
  var Parameters = PluginManager.parameters('CharacterMovement')

  var bank = []

  Object.keys(Parameters).forEach((parameterKey, index) => {
    var parameterKeyArray = parameterKey.split('_')
    var lastIndex = parameterKeyArray && parameterKeyArray[parameterKeyArray.length - 1]

    var isID = parameterKeyArray[0] === 'Actor' && !isNaN(lastIndex)

    if (isID) {
      bank = bank.concat({
        actor: lastIndex,
        sheet: {},
      })
    } else {
      var key = parameterKeyArray
      key.length = key.length - 1
      key = key.join('_')

      if (bank[bank.length - 1]) {
        bank[bank.length - 1].sheet = {
          ...bank[bank.length - 1].sheet,
          [key]: Parameters[parameterKey],
        }
      }
    }
  })

  var actors = [];
  var isDashing, isWalking = false;
  var isStopped = true;

  var Scene_Map_Create = Scene_Map.prototype.create;
  Scene_Map.prototype.create = function() {
    Scene_Map_Create.call(this);

    actors = bank.map(entry => $gameActors.actor(entry.actor))
  };

  var Scene_Map_Update = Scene_Map.prototype.update;
  Scene_Map.prototype.update = function() {
    Scene_Map_Update.call(this);

    managePlayerMovement();
  };

  var setSheet = function(action) {
    actors.forEach(function (actor, index) {
      actor.setCharacterImage(bank[index].sheet[action]),
      actor.characterIndex()
    })
  }

  var managePlayerMovement = function() {
    isDashing = (!!$gamePlayer.getInputDirection() && $gamePlayer.isDashing()) || !!$gameTemp.isDestinationValid();
    isWalking = !!$gamePlayer.getInputDirection() && !isDashing;
    isStopped = !isWalking && !isDashing;

    if (isStopped) {
      setSheet("Idle_Character_Sheet");
    } else if (isDashing) {
      setSheet("Running_Character_Sheet");
    } else if (isWalking) {
      setSheet("Walking_Character_Sheet");
    }

    $gamePlayer.refresh();
  }
})();
