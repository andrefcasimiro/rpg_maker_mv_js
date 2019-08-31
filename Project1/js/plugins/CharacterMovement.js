/*
  <Character Movement>
  v 0.1 - 31 August 2019

  GIT_HUB:
  https://github.com/andrefcasimiro/rpg_maker_mv_js/blob/master/Project1/js/plugins/CharacterMovement.js

  DESCRIPTION:
  Allows for switching between 3 different character sheets: Idle, Walk and Run, according to our movement state.

  INSTRUCTIONS:
  1. Copy and paste plugin.
  2. Choose Idle, Walk and Run character sheets in the plugin's parameters window.
  3. Run game.

  PARAMS:
  @param Actor_{ID}
  ID - must be equal to the actor index in the database

  @param {Pose}_{ID}
  Pose - must be one of the following: 'Idle', 'Walk' or 'Run'
  ID - can be anything as long as you don't repeate @param names
*/

/*:
* @plugindesc Allow for player movement to cycle between 3 character sheets: idle, walk and run.
* @author FBU <andrefcasimiro(at)gmail.com>
*
* // ACTOR 1 --------------------------------
* @param Actor_1
*
* @param Idle_Actor1
* @desc "The character set for idle movement"
* @require 1
* @dir img/characters/
* @type file
* @parent Actor_1

* @param Walk_Actor1
* @desc "The character set for walk movement"
* @require 1
* @dir img/characters/
* @type file
* @parent Actor_1
*
* @param Run_Actor1
* @desc "The character set for running movement"
* @require 1
* @dir img/characters/
* @type file
* @parent Actor_1
*
*/

(function() {
  var Parameters = PluginManager.parameters('CharacterMovement');

  var bank = [];
  Object.keys(Parameters).forEach((parameterKey, index) => {
    var parameterKeyArray = parameterKey.split('_');
    var lastIndex = parameterKeyArray && parameterKeyArray[parameterKeyArray.length - 1];

    var isID = parameterKeyArray[0] === 'Actor' && !isNaN(lastIndex);
    if (isID) {
      bank = bank.concat({
        actor: lastIndex,
        sheet: {},
      });
    } else {
      if (!Parameters[parameterKey]) {
        return; 
      }
      var key = parameterKeyArray;
      key.length = key.length - 1;
      key = key.join('_');

      if (bank[bank.length - 1]) {
        bank[bank.length - 1].sheet = {
          ...bank[bank.length - 1].sheet,
          [key]: Parameters[parameterKey],
        };
      }
    }
  })

  var actors = [];
  var isDashing, isWalking = false;
  var isStopped = true;
  var action = 0;
  var _cachedAction;

  var Scene_Map_Create = Scene_Map.prototype.create;
  Scene_Map.prototype.create = function() {
    Scene_Map_Create.call(this);

    actors = bank.map(entry => $gameActors.actor(entry.actor));
  };

  var Scene_Map_Update = Scene_Map.prototype.update;
  Scene_Map.prototype.update = function() {
    Scene_Map_Update.call(this);

    managePlayerMovement();
  };

  var setSheet = function(action) {
    actors.forEach(function (actor, index) {
      if (!Object.keys(bank[index].sheet).length) {
        return;
      }

      actor.setCharacterImage(bank[index].sheet[action], actor.characterIndex())
    });
  }

  var managePlayerMovement = function() {
    isDashing = (!!$gamePlayer.getInputDirection() && $gamePlayer.isDashing()) || !!$gameTemp.isDestinationValid();
    isWalking = !!$gamePlayer.getInputDirection() && !isDashing;
    isStopped = !isWalking && !isDashing;

    if (isStopped) {
      action = 0;
    } else if (isDashing) {
      action = 1;
    } else if (isWalking) {
      action = 2;
    }

    if (action !== _cachedAction) {
      action === 0
        ? setSheet('Idle')
        : action === 2
            ? setSheet('Walk')
            : setSheet('Run');

      $gamePlayer.refresh();
      _cachedAction = action;
    }
  }
})();
