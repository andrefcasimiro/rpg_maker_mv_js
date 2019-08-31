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
    var _split = parameterKey.split('_')
    var lastIndex = _split && _split[_split.length - 1]

    var isID = false
    if (lastIndex) {
      isID = !isNaN(lastIndex)
    }

    if (isID) {
      bank = bank.concat({
        actor: lastIndex,
        sheet: {},
      })
    } else {
      // Since we cant have repeated param keys, we have to add a unique identifier at the end of each prop
      // Which we remove here
      var paramKey = _split
      paramKey.length = paramKey.length - 1
      paramKey = paramKey.join('_')

      if (bank[bank.length - 1]) {
        bank[bank.length - 1].sheet = {
          ...bank[bank.length - 1].sheet,
          [paramKey]: Parameters[parameterKey],
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

  var setIdleSheet = function() {
    actors.forEach(function (actor, index) {
      actor.setCharacterImage(bank[index].sheet.Idle_Character_Sheet),
      actor.characterIndex()
    })
  }

  var setWalkingSheet = function() {
    actors.forEach(function (actor, index) {
      actor.setCharacterImage(bank[index].sheet.Walking_Character_Sheet),
      actor.characterIndex()
    })
  }

  var setRunningSheet = function() {
    actors.forEach(function (actor, index) {
      actor.setCharacterImage(bank[index].sheet.Running_Character_Sheet),
      actor.characterIndex()
    })
  }

  var managePlayerMovement = function() {
    isDashing = $gamePlayer.isDashing();
    isWalking = !!$gamePlayer.getInputDirection();
    isStopped = !$gamePlayer.getInputDirection() && !$gamePlayer.isMoving();

    if (isStopped) {
      setIdleSheet();
    } else if (isDashing) {
      setRunningSheet();
    } else if (isWalking) {
      setWalkingSheet();
    }

    $gamePlayer.refresh();
  }
})();
