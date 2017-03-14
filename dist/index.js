module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 8);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

module.exports = require("lodash");

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

const log = console.log;

const _ = __webpack_require__(0);

const MODE_PLAYER   = 'player';
const MODE_MONSTER  = 'monster';

const EFFECT_NORMAL = 96;
const EFFECT_HASTE  = 126;
const EFFECT_SLOW   = 48;

const MAX_GAUGE     = 65536;
const TIME_SLICE    = 33;

const getPercentage = (gauge) =>
{
	return gauge / MAX_GAUGE;
};

const characterTick = (effect, speed, gauge)=>
{
	const result = (((effect * (speed + 20)) / 16));
	gauge += Math.round(result);
    return gauge;
};
// Normal speed:

// ((96 * (Speed + 20)) * (255 - ((Battle Speed - 1) * 24))) / 16

// If Hasted:

// ((126 * (Speed + 20)) * (255 - ((Battle Speed - 1) * 24))) / 16

// If Slowed:

// ((48 * (Speed + 20)) * (255 - ((Battle Speed - 1) * 24))) / 16

// export function *timerBrowserNotNode()
// {
// 	let time = performance.now();
// 	let lastTick = time;
// 	yield {time, difference: 0};
// 	while(true)
// 	{
// 		time = performance.now();
// 		yield {time, difference: time - lastTick};
// 	}
// }

class Timer
{
	constructor(window, performance)
	{
		const me = this;
		me.window = window;
		me.performance = performance;
		me.running = false;
		me.tickBound = me.tick.bind(me);
	}

	tick(time)
	{
		const me = this;
		const now = me.performance.now();
		const previousTick = me.lastTick;
		me.difference = now - me.lastTick;
		me.lastTick = now;
		if(me.running === true)
		{
			me.window.requestAnimationFrame(me.tickBound);
			if(me.tickCallback)
			{
				me.tickCallback(time, me.difference, now, previousTick);
			}
		}
	}

	startTimer(callback)
	{
		const me = this;
		me.running = true;
		me.tickCallback = callback;
		me.lastTick = me.performance.now();
		me.window.requestAnimationFrame(me.tickBound);
	}

	stopTimer()
	{
		const me = this;
		me.running = false;
	}

	resume()
	{
		const me = this;
		me.running = true;
		me.window.requestAnimationFrame(me.tickBound);
	}
}

// TODO: make monster mode work, I don't get the algo man
class BattleTimer
{
	constructor(window, performance, counter=0, gauge=0, effect=EFFECT_NORMAL, mode=MODE_PLAYER, speed=1)
	{
		const me = this;
		me.window = window;
		me.performance = performance;
		me.timer = new Timer(me.window, me.performance);
		me.counter = counter;
		me.gauge = gauge;
		me.effect = effect;
		me.mode = mode;
		me.speed = speed;
	}

	startTimer(doneCallback, progressCallback)
	{
		const me = this;
		me.doneCallback = doneCallback;
		me.progressCallback = progressCallback;
		const THIRTY_TIMES_A_SECOND = 1000 / 30;
		if(_.isNil(me.thirtyMillisecondCounter))
		{
			me.thirtyMillisecondCounter = 0;
		}
		me.timer.startTimer((time, difference, now, previousTick)=>
		{
			me.thirtyMillisecondCounter += difference;
			if(me.thirtyMillisecondCounter >= THIRTY_TIMES_A_SECOND)
			{
				me.thirtyMillisecondCounter = 0;
				me.counter++;
				me.gauge = characterTick(me.effect, me.speed, me.gauge);
				if(me.progressCallback)
				{
					me.progressCallback(getPercentage(me.gauge), me.gauge);
				}
				if(me.gauge >= MAX_GAUGE)
				{
					me.gauge = MAX_GAUGE;
					me.stopTimer();
					me.doneCallback(1, me.gauge);
				}
			}
		});
	}

	stopTimer()
	{
		const me = this;
		me.timer.stopTimer();
	}

	resume()
	{
		const me = this;
		me.timer.resume();
	}
}

module.exports = {
	MODE_PLAYER,
	MODE_MONSTER,
	EFFECT_HASTE,
	EFFECT_NORMAL,
	EFFECT_SLOW,
	MAX_GAUGE,
	getPercentage,
	characterTick,
	Timer,
	BattleTimer
};


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

const Row = __webpack_require__(4);
const _ = __webpack_require__(0);
const {Subject} = __webpack_require__(7);
const {BattleTimer, MODE_PLAYER, EFFECT_NORMAL} = __webpack_require__(1);
const BattleState = __webpack_require__(3);
const {
	isGauntlet,
	isAtlasArmlet,
	isEarring,
	isGenjiGlove,
	isHeroRing,
	isOffering
} = __webpack_require__(5);

const none = _.negate(_.every);
const notNil = _.negate(_.isNil);

let _INCREMENT = 0;

const getCharacter = (entity)=>
{
	var vm = {};
	vm.entity = entity;
	vm.percentage = 0;
	vm.name = '';
	vm.battleState = BattleState.WAITING;
	vm.hitPoints = 10;
	vm.vigor = 10;
	vm.speed = 80;
	vm.stamina = 10;
	vm.magicPower = 10;
	vm.evade = 1;
	vm.magicBlock = 10;
	vm.defense = 10;
	vm.magicDefense = 10;
	vm.battlePower = 1;
	vm.hitRate = 100;
	vm.dead = false;
	vm.level = 3;
	vm.rightHand;
	vm.leftHand;
	vm.head;
	vm.body;
	vm.relic1;
	vm.relic2;
	vm._row = Row.FRONT;
	vm.id = _INCREMENT++;
	vm.subject = new Subject();
	vm.generator = makeBattleTimer(vm);
	vm.type = 'Character';
	vm.characterType = 'player';
	return vm;
};

function makePlayer(entity)
{
	var chr = getCharacter(entity);
	chr.characterType = 'player';
	chr.battlePower = 50;
	chr.entity = entity;
	return chr;
}

function makeMonster(entity)
{
	var chr = getCharacter(entity);
	chr.characterType = 'monster';
	chr.entity = entity;
	return chr;
}

function makeReadyCharacter(entity)
{
	var chr = getCharacter(entity);
	chr.battleState = BattleState.READY;
	return chr;
}

function getRandomMonsterVigor()
{
	return BattleUtils.getRandomMonsterVigor();
}

function makeBattleTimer(chr)
{
	return new BattleTimer(0, 0, EFFECT_NORMAL, MODE_PLAYER, chr.speed);
}

// TODO: figure out reflection/mirrors
function equippedWithNoRelics(chr)
{
	return _.isNil(_.get(chr, 'relic1')) && _.isNil(_.get(chr, 'relic2'));
}

const characterRelics           = (chr) => [_.get(chr, 'relic1'), _.get(chr, 'relic2')];
const equippedWith              = (chr, isRelicType) => _.some(characterRelics(chr), isRelicType);
const equippedWithGauntlet      = _.partialRight(equippedWith, isGauntlet);
const equippedWithOffering      = _.partialRight(equippedWith, isOffering);
const equippedWithGenjiGlove    = _.partialRight(equippedWith, isGenjiGlove);
const equippedWithAtlasArmlet   = _.partialRight(equippedWith, isAtlasArmlet);
const equippedWithHeroRing      = _.partialRight(equippedWith, isHeroRing);
const equippedWith2HeroRings    = (chr) => _.every(characterRelics(chr), isHeroRing);
const notEquippedWith2HeroRings = _.negate(equippedWith2HeroRings);
const equippedWith1HeroRing     = (chr) => _.every([equippedWithHeroRing, notEquippedWith2HeroRings], f => f(chr));
const equippedWithEarring       = _.partialRight(equippedWith, isEarring);
const equippedWith2Earrings     = (chr) => _.every(characterRelics(chr), isEarring);
const notEquippedWith2Earrings  = _.negate(equippedWith2Earrings);
const equippedWith1Earring      = (chr) => _.every([equippedWithEarring, notEquippedWith2Earrings], f => f(chr));

const rightHandHasWeapon        = (chr) => notNil(_.get(chr, 'rightHand'));
const leftHandHasWeapon         = (chr) => notNil(_.get(chr, 'leftHand'));
const rightHandHasNoWeapon      = _.negate(rightHandHasWeapon);
const leftHandHasNoWeapon       = _.negate(leftHandHasWeapon);
const hasZeroWeapons            = (chr) => _.every([rightHandHasNoWeapon, leftHandHasNoWeapon], f => f(chr));
const has2Weapons               = (chr) => _.every([rightHandHasWeapon, leftHandHasWeapon], f => f(chr));
const doesNotHave2Weapons       = _.negate(has2Weapons);

const oneOrZeroWeapons = (chr) =>
{
	if(rightHandHasWeapon(chr) && leftHandHasNoWeapon(chr))
	{
		return true;
	}
	else if(rightHandHasNoWeapon(chr) && leftHandHasWeapon(chr))
	{
		return true;
	}
	else if(hasZeroWeapons(chr))
	{
		return true;
	}
	else
	{
		return false;
	}
};

function getRow(chr)
{
	return chr._row;
}
function setRow(chr, newRow)
{
	if(newRow === chr._row)
	{
		return;
	}
	var oldRow = chr._row;
	chr._row = newRow;
	chr.subject.onNext({
		type: "rowChanged",
		target: chr,
		oldRow: oldRow,
		newRow: newRow
	});
}

function toggleRow(chr)
{
	if(chr.row === Row.FRONT)
	{
		chr.row = Row.BACK;
	}
	else
	{
		chr.row = Row.FRONT;
	}
}

module.exports = {
	getCharacter,
    makePlayer,
    makeReadyCharacter,
    equippedWithNoRelics,
    equippedWithGauntlet,
    rightHandHasWeapon,
    leftHandHasWeapon,
    rightHandHasNoWeapon,
    leftHandHasNoWeapon,
    hasZeroWeapons,
	equippedWithOffering,
	equippedWithGenjiGlove,
	oneOrZeroWeapons,
	equippedWithAtlasArmlet,
	equippedWith1HeroRing,
	equippedWith2HeroRings,
	equippedWith1Earring,
	equippedWith2Earrings
};

/***/ }),
/* 3 */
/***/ (function(module, exports) {

const BattleState = {
	WAITING: 'WAITING', // waiting for ATB gauge to fill
	READY: 'READY', // ATB gauge is filled, waiting for a turn
	DEFENDING: 'DEFENDING',
	ANIMATING: 'ANIMATING',
	RUNNING: 'RUNNING', // like READY in that you can run, but then stop and your ATB gauge is still full
	DEAD: 'DEAD'
};

module.exports = BattleState;

/***/ }),
/* 4 */
/***/ (function(module, exports) {

class Row
{
	static get FRONT(){return "front"};
	static get BACK(){return "back"};
}

module.exports = Row;

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

// http://www.rpglegion.com/ff6/items/relics.htm

const _ = __webpack_require__(0);

const getRelic = (relicType) =>
{
    return {type: 'relic', relicType};
}

const AtlasArmlet = 'Atlas Armlet';
const Earring      = 'Earring';
const Gauntlet     = 'Gauntlet';
const GenjiGlove   = 'Genji Glove';
const HeroRing     = 'Hero Ring';
const Offering     = 'Offering';

const getAtlasArmletRelic = () => getRelic(AtlasArmlet);
const getEarringRelic     = () => getRelic(Earring);
const getGauntletRelic    = () => getRelic(Gauntlet);
const getGenjiGloveRelic  = () => getRelic(GenjiGlove);
const getHeroRingRelic    = () => getRelic(HeroRing);
const getOfferingRelic    = () => getRelic(Offering);

const isRelic       = (o) => _.get(o, 'type') === 'relic';
const isRelicType   = (type, relic) => _.get(relic, 'relicType') === type;

const isAtlasArmlet = _.partial(isRelicType, AtlasArmlet);
const isEarring     = _.partial(isRelicType, Earring);
const isGauntlet    = _.partial(isRelicType, Gauntlet);
const isGenjiGlove  = _.partial(isRelicType, GenjiGlove);
const isHeroRing    = _.partial(isRelicType, HeroRing);
const isOffering    = _.partial(isRelicType, Offering);

module.exports = {
    isGauntlet,
	isAtlasArmlet,
	isEarring,
	isGenjiGlove,
	isHeroRing,
	isOffering,
	getAtlasArmletRelic,
    getGauntletRelic
};

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

const log = console.log;
const _ = __webpack_require__(0);

const {
	equippedWithGauntlet,
	equippedWithOffering,
	equippedWithGenjiGlove,
	oneOrZeroWeapons,
	equippedWithAtlasArmlet,
	equippedWith1HeroRing,
	equippedWith2HeroRings,
	equippedWith1Earring,
	equippedWith2Earrings
} = __webpack_require__(2);

const PERFECT_HIT_RATE = 255;

const divide = (a, b)=>
{
	return Math.floor(a / b);
};

const getRandomNumberFromRange = (start, end)=>
{
	var range = end - start;
	var result = Math.random() * range;
	result += start;
	return Math.round(result);
};

// level is an int
const getDamageStep1 = (
	vigor = 0,
	battlePower = 0,
	spellPower = 0,
	magicPower = 0,
	level = 0,
	equippedWithGauntlet = false,
	equippedWithOffering =  false,
	standardFightAttack =  true,
	isPhysicalAttack =  true,
	isPlayerAndNotMonster =  true,
	genjiGloveEquipped =  false,
	oneOrZeroWeapons = true
)=>
{

	var damage = 0;

	if(isPhysicalAttack === false && isPlayerAndNotMonster === true)
	{
		damage = spellPower * 4 + (level * magicPower * spellPower / 32);
	}
	else if(isPhysicalAttack === false && isPlayerAndNotMonster === false)
	{
		damage = spellPower * 4 + (level * (magicPower * 3/2) * spellPower / 32);
	}
	else if(isPhysicalAttack === true && isPlayerAndNotMonster === true)
	{
		var vigor2 = vigor * 2;
		if (vigor >= 128)
		{
			vigor2 = 255;
		}

		var attack = battlePower + vigor2;

		if (equippedWithGauntlet)
		{
			attack += (battlePower * 3 / 4);
		}

		damage = battlePower + ( (level * level * attack) / 256) * 3 / 2;

		if (equippedWithOffering)
		{
			damage /= 2;
		}

		if (standardFightAttack && genjiGloveEquipped && oneOrZeroWeapons)
		{
			damage = Math.ceil(damage * 3/4);
		}
	}
	else if(isPhysicalAttack === true && isPlayerAndNotMonster === false)
	{
		damage = level * level * (battlePower * 4 + vigor) / 256;
	}

	return damage;
};

const getRandomMonsterVigor = ()=>
{
	return getRandomNumberFromRange(56, 63);
};

const getDamageStep2 = (
	damage = 0,
	isPhysicalAttack =  true,
	equippedWithAtlasArmlet =  false,
	equippedWith1HeroRing =  false,
	equippedWith2HeroRings =  false,
	equippedWith1Earring =  false,
	equippedWith2Earrings = false
)=>
{
	if(isPhysicalAttack && (equippedWithAtlasArmlet || equippedWith1HeroRing))
	{
		damage *= 5/4;
	}
	if(isPhysicalAttack === false && (equippedWith1Earring || equippedWith2HeroRings))
	{
		damage *= 5/4;
	}
	if(isPhysicalAttack === false && (equippedWith2Earrings || equippedWith2HeroRings))
	{
		damage += (damage / 4) + (damage / 4);
	}
	return damage;
};

const getDamageStep3 = (
	damage = 0,
	isPhysicalAttack = true,
	attackingMultipleTargets = false)=>
{
	if(isPhysicalAttack === false && attackingMultipleTargets === true)
	{
		return damage / 2;
	}
	else
	{
		return damage;
	}
};

// TODO: figure out 'if fight command'
const getDamageStep4 = (damage = 0, attackerIsInBackRow = false) =>
{
	if(attackerIsInBackRow === true)
	{
		return damage / 2;
	}
	else
	{
		return damage;
	}
};

const getCriticalHit = ()=> getRandomNumberFromRange(1, 32) === 32;

const getDamageStep5 = (damage = 0,
	hasMorphStatus = false,
	hasBerserkStatusAndPhysicalAttack = false,
	isCriticalHit = false) =>
{
	var multiplier = 0;

	if(hasMorphStatus)
	{
		multiplier += 3;
	}

	if(hasBerserkStatusAndPhysicalAttack)
	{
		multiplier += 2;
	}

	if(isCriticalHit)
	{
		multiplier += 3;
	}

	damage += ((damage / 2) * multiplier);
	return damage;
}

const getDamageModificationsVariance = ()=> getRandomNumberFromRange(224, 255);

const getDamageStep6 = (damage = 0,
	defense = 0,
	magicalDefense = 0,
	variance =  224,
	isPhysicalAttack =  true,
	isHealingAttack =  false,
	targetHasSafeStatus =  false,
	targetHasShellStatus =  false,
	targetDefending =  false,
	targetIsInBackRow =  false,
	targetHasMorphStatus =  false,
	targetIsSelf =  false,
	targetIsCharacter =  false,
	attackerIsCharacter =  true) =>
{

	damage = (damage * variance / 256) + 1;

	// defense modification
	if(isPhysicalAttack)
	{
		damage = (damage * (255 - defense) / 256) + 1;
	}
	else
	{
		damage = (damage * (255 - magicalDefense) / 256) + 1;
	}

	// safe / shell
	if((isPhysicalAttack && targetHasSafeStatus) || (isPhysicalAttack === false && targetHasShellStatus))
	{
		damage = (damage * 170 / 256) + 1;
	}

	// target defending
	if(isPhysicalAttack && targetDefending)
	{
		damage /= 2;
	}

	// target's back row
	if(isPhysicalAttack && targetIsInBackRow)
	{
		damage /= 2;
	}

	// morph
	if(isPhysicalAttack === false && targetHasMorphStatus)
	{
		damage /= 2;
	}

	// self damage (healing attack skips this step)
	if(isHealingAttack === false)
	{
		if (targetIsSelf && targetIsCharacter && attackerIsCharacter)
		{
			damage /= 2;
		}
	}

	return damage;
};

const getDamageStep7 = (damage = 0,
						hittingTargetsBack = false,
						isPhysicalAttack = true) =>
{
	var multiplier = 0;
	if(isPhysicalAttack && hittingTargetsBack)
	{
		multiplier += 1;
	}

	damage += ((damage / 2) * multiplier);
	return damage;
};

const getDamageStep8 = (damage = 0, targetHasPetrifyStatus = false)=>
{
	if(targetHasPetrifyStatus)
	{
		damage = 0;
	}
	return damage;
};

const getDamageStep9 = (
	damage = 0,
	elementHasBeenNullified =  false,
	targetAbsorbsElement =  false,
	targetIsImmuneToElement =  false,
	targetIsResistantToElement =  false,
	targetIsWeakToElement = false
) =>
{
	if(elementHasBeenNullified)
	{
		return 0;
	}

	if(targetAbsorbsElement)
	{
		return -damage;
	}

	if(targetIsImmuneToElement)
	{
		return 0;
	}

	if(targetIsResistantToElement)
	{
		damage /= 2;
		return damage;
	}

	if(targetIsWeakToElement)
	{
		damage *= 2;
		return damage;
	}

	return damage;
};

function getRandomHitOrMissValue()
{
	return getRandomNumberFromRange(0, 99);
}

function getRandomStaminaHitOrMissValue()
{
	return getRandomNumberFromRange(0, 127);
}

function getRandomImageStatusRemoval()
{
	return getRandomNumberFromRange(0, 3);
}

function getRemoveImageStatus()
{
	return getRandomNumberFromRange(1, 4) === 4;
}

const getHitResult = (hit, removeImageStatus=false) =>
{
	return {
		hit,
		removeImageStatus
	};
};

// Step 4e. Chance to hit

//   1. BlockValue = (255 - MBlock * 2) + 1

//   2. If BlockValue > 255 then BlockValue = 255
//      If BlockValue < 1 then BlockValue = 1

//   3. If ((Hit Rate * BlockValue) / 256) > [0..99] then you hit; otherwise,
//      you miss.
const step4e = magicBlock =>
{
	let blockValue = (255 - magicBlock * 2) + 1;
	blockValue = _.clamp(blockValue, 1, 255);
	return blockValue;
};

// returns HitResult
/*
	These are ints, not numbers:

	int randomHitOrMissValue =  0,
	int randomStaminaHitOrMissValue =  0,
	int randomImageStatusRemovalValue =  0,
	int hitRate =  180,  // TODO: need weapon's info, this is where hitRate comes from
	int magicBlock =  0,
	int targetStamina =  null,
	specialAttackType:AttackType
*/
const getHitFromBlockValue = (isPhysicalAttack=true, hitRate, magicBlockOrDefense, step4e, randomHitOrMissValue)=>
{
	let blockValue;
	// NOTE: [jwarden 1.23.2017] After re-reading this bug for umpteenth time,
	// I'm thinking of attempting a fix, and allowing this to be toggled on
	// at a later date. (tl;dr; Originally, magicBlock was used causing all kinds
	// of havoc).
	// http://everything2.com/title/Final+Fantasy+VI+Evade+Bug
	// NOTE: here in case we handle that whole 'magic block' bug; for now both if thens do the same
	if(isPhysicalAttack === false)
	{
		log("magicBlock:", magicBlockOrDefense);
		log("hitRate:", hitRate);
		blockValue =  step4e(magicBlockOrDefense);
	}
	else
	{
		log("defenese:", magicBlockOrDefense);
		log("hitRate:", hitRate);
		blockValue =  step4e(magicBlockOrDefense);
	}

	//   3. If ((Hit Rate * BlockValue) / 256) > [0..99] then you hit; otherwise,
	//      you miss.
	const hitRateTimesBlockValue = hitRate * blockValue;
	const result = hitRateTimesBlockValue / 256;
	// log("getHit results:");
	// log("hitRate:", hitRate);
	// log("blockValue:", blockValue);
	// log("hitRateTimesBlockValue:", hitRateTimesBlockValue);
	// log("result:", result);
	// log("randomHitOrMissValue:", randomHitOrMissValue);
	if( result > randomHitOrMissValue)
	{
		return true;
	}
	else
	{
		return false;
	}
};

const getMagicBlockOrDefense = (isPhysicalAttack=true, magicBlock, defense)=>
{
	if(isPhysicalAttack === true)
	{
		return defense;
	}
	else
	{
		return magicBlock;
	}
};

const getHitDefaultGetHitOptions = ()=> ({
	randomHitOrMissValue: 0,
	randomStaminaHitOrMissValue: 0,
	isPhysicalAttack: true,
	targetHasClearStatus: false,
	protectedFromWound: false,
	attackMissesDeathProtectedTargets: false,
	attackCanBeBlockedByStamina: true,
	spellUnblockable: false,
	targetHasSleepStatus: false,
	targetHasPetrifyStatus: false,
	targetHasFreezeStatus: false,
	targetHasStopStatus: false,
	backOfTarget: false,
	targetHasImageStatus: false,
	hitRate: 0,  // TODO: need weapon's info, this is where hitRate comes from
	defense: 0,
	magicBlock: 0,
	targetStamina: 0,
	specialAttackType: null
});
	
const getHit = (options=getHitDefaultGetHitOptions()) =>
{
	const randomHitOrMissValue              = _.get(options, 'randomHitOrMissValue');
	const randomStaminaHitOrMissValue       = _.get(options, 'randomStaminaHitOrMissValue');
	const isPhysicalAttack                  = _.get(options, 'isPhysicalAttack');
	const isMagicalAttack					= !isPhysicalAttack;
	const targetHasClearStatus              = _.get(options, 'targetHasClearStatus');
	const protectedFromWound                = _.get(options, 'protectedFromWound');
	const attackMissesDeathProtectedTargets = _.get(options, 'attackMissesDeathProtectedTargets');
	const attackCanBeBlockedByStamina       = _.get(options, 'attackCanBeBlockedByStamina');
	const spellUnblockable                  = _.get(options, 'spellUnblockable');
	const targetHasSleepStatus              = _.get(options, 'targetHasSleepStatus');
	const targetHasPetrifyStatus            = _.get(options, 'targetHasPetrifyStatus');
	const targetHasFreezeStatus             = _.get(options, 'targetHasFreezeStatus');
	const targetHasStopStatus               = _.get(options, 'targetHasStopStatus');
	const backOfTarget                      = _.get(options, 'backOfTarget');
	const targetHasImageStatus              = _.get(options, 'targetHasImageStatus');
	const hitRate                           = _.get(options, 'hitRate');
	const defense                           = _.get(options, 'defense');
	const magicBlock                        = _.get(options, 'magicBlock');
	const targetStamina                     = _.get(options, 'targetStamina');
	const specialAttackType                 = _.get(options, 'specialAttackType');

	if(isPhysicalAttack && targetHasClearStatus)
	{
		return getHitResult(false);
	}

	if(isPhysicalAttack === false && targetHasClearStatus)
	{
		return getHitResult(true);
	}

	if(protectedFromWound && attackMissesDeathProtectedTargets)
	{
		return getHitResult(false);
	}

	if(isPhysicalAttack === false && spellUnblockable)
	{
		return getHitResult(true);
	}

	if(_.isNil(specialAttackType))
	{
		if(targetHasSleepStatus || targetHasPetrifyStatus || targetHasFreezeStatus || targetHasStopStatus)
		{
			return getHitResult(true);
		}

		if(isPhysicalAttack && backOfTarget)
		{
			return getHitResult(true);
		}

		if(hitRate === PERFECT_HIT_RATE)
		{
			return getHitResult(true);
		}

		if(isPhysicalAttack && targetHasImageStatus)
		{
			var removeImageStatus = getRemoveImageStatus();
			if(removeImageStatus)
			{
				// this'll remove Image status
				return getHitResult(false, true);
			}
			else
			{
				return getHitResult(false);
			}
		}


		// Step 4e. Chance to hit

		//   1. BlockValue = (255 - MBlock * 2) + 1
	
		//   2. If BlockValue > 255 then BlockValue = 255
		//      If BlockValue < 1 then BlockValue = 1

		//   3. If ((Hit Rate * BlockValue) / 256) > [0..99] then you hit; otherwise,
		//      you miss.
		const magicBlockOrDefense = getMagicBlockOrDefense(isPhysicalAttack, magicBlock, defense);
		const hitFromBlockValue = getHitFromBlockValue(isPhysicalAttack, hitRate, magicBlockOrDefense, step4e, randomHitOrMissValue);
		return getHitResult(hitFromBlockValue);
	}

	// Most attacks use step 4 instead of this step. Only Break, Doom, Demi,
    // Quartr, X-Zone, W Wind, Shoat, Odin, Raiden, Antlion, Snare, X-Fer, and
    // Grav Bomb use this step.

    // Step 5b. Check if Stamina blocks

    //   If target's stamina >= [0..127] then the attack misses (even if it hit in
    //   step 5a); otherwise, the attack hits as long as it hit in step 5a.

	const magicBlockOrDefense = getMagicBlockOrDefense(isPhysicalAttack, magicBlock, defense);
	const hitFromBlockValue = getHitFromBlockValue(isPhysicalAttack, hitRate, magicBlockOrDefense, step4e, randomHitOrMissValue);
	log("      ");
	log("\n");
	log("hitFromBlockValue:", hitFromBlockValue);
	log("randomHitOrMissValue:", randomHitOrMissValue);
	log("randomStaminaHitOrMissValue:", randomStaminaHitOrMissValue);
	log("targetStamina:", targetStamina);
	if(hitFromBlockValue === true)
	{
		if(targetStamina >= randomStaminaHitOrMissValue)
		{
			return getHitResult(false);
		}
		else
		{
			return getHitResult(true);
		}
	}
	else
	{
		return getHitResult(false);
	}
};

const getDamageResult = (damage, criticalHit, removeImageStatus)=>
{
	return {
		damage,
		criticalHit,
		removeImageStatus
	};
};

// returns TargetHitResult 
/*
	int hitRate =  180,  // TODO: need weapon's info, this is where hitRate comes from
	int magicBlock =  0,
	int targetStamina =  null,
*/
const getDefaultDamageOptions = (
	attacker, 
	getCriticalHitFunction=getCriticalHit, 
	getDamageModificationsVarianceFunction=getDamageModificationsVariance
)=>
{
	return {
		attacker, // Character
		getCriticalHitFunction,
		getDamageModificationsVarianceFunction,
		targetStamina: null,
		isPhysicalAttack: true,
		targetHasClearStatus: false,
		protectedFromWound: false,
		attackMissesDeathProtectedTargets: false,
		attackCanBeBlockedByStamina: true,
		spellUnblockable: false,
		targetHasSleepStatus: false,
		targetHasPetrifyStatus: false,
		targetHasFreezeStatus: false,
		targetHasStopStatus: false,
		targetHasSafeStatus: false,
		targetHasShellStatus: false,
		targetDefending: false,
		targetIsInBackRow: false,
		targetHasMorphStatus: false,
		targetIsSelf: false,
		targetIsCharacter: false,
		backOfTarget: false,
		targetHasImageStatus: false,
		hitRate: 0,  // TODO: need weapon's info, this is where hitRate comes from
		magicBlock: 0,
		specialAttackType: null,
		attackerIsCharacter: true,
		attackingMultipleTargets: false,
		attackerIsInBackRow: false,
		attackerHasMorphStatus: false,
		attackerHasBerserkStatusAndPhysicalAttack: false,
		elementHasBeenNullified: false,
		targetAbsorbsElement: false,
		targetIsImmuneToElement: false,
		targetIsResistantToElement: false,
		targetIsWeakToElement: false
	};
};
const getDamage = (options=getDefaultDamageOptions) =>
{
	const attacker                                  = _.get(options, 'attacker');
	const targetStamina                             = _.get(options, 'targetStamina');
	const isPhysicalAttack                          = _.get(options, 'isPhysicalAttack');
	const targetHasClearStatus                      = _.get(options, 'targetHasClearStatus');
	const protectedFromWound                        = _.get(options, 'protectedFromWound');
	const attackMissesDeathProtectedTargets         = _.get(options, 'attackMissesDeathProtectedTargets');
	const attackCanBeBlockedByStamina               = _.get(options, 'attackCanBeBlockedByStamina');
	const spellUnblockable                          = _.get(options, 'spellUnblockable');
	const targetHasSleepStatus                      = _.get(options, 'targetHasSleepStatus');
	const targetHasPetrifyStatus                    = _.get(options, 'targetHasPetrifyStatus');
	const targetHasFreezeStatus                     = _.get(options, 'targetHasFreezeStatus');
	const targetHasStopStatus                       = _.get(options, 'targetHasStopStatus');
	const targetHasSafeStatus                       = _.get(options, 'targetHasSafeStatus');
	const targetHasShellStatus                      = _.get(options, 'targetHasShellStatus');
	const targetDefending                           = _.get(options, 'targetDefending');
	const targetIsInBackRow                         = _.get(options, 'targetIsInBackRow');
	const targetHasMorphStatus                      = _.get(options, 'targetHasMorphStatus');
	const targetIsSelf                              = _.get(options, 'targetIsSelf');
	const targetIsCharacter                         = _.get(options, 'targetIsCharacter');
	const backOfTarget                              = _.get(options, 'backOfTarget');
	const targetHasImageStatus                      = _.get(options, 'targetHasImageStatus');
	const hitRate                                   = _.get(options, 'hitRate');
	const magicBlock                                = _.get(options, 'magicBlock');
	const specialAttackType                         = _.get(options, 'specialAttackType');
	const attackerIsCharacter                       = _.get(options, 'attackerIsCharacter');
	const attackingMultipleTargets                  = _.get(options, 'attackingMultipleTargets');
	const attackerIsInBackRow                       = _.get(options, 'attackerIsInBackRow');
	const attackerHasMorphStatus                    = _.get(options, 'attackerHasMorphStatus');
	const attackerHasBerserkStatusAndPhysicalAttack = _.get(options, 'attackerHasBerserkStatusAndPhysicalAttack');
	const elementHasBeenNullified                   = _.get(options, 'elementHasBeenNullified');
	const targetAbsorbsElement                      = _.get(options, 'targetAbsorbsElement');
	const targetIsImmuneToElement                   = _.get(options, 'targetIsImmuneToElement');
	const targetIsResistantToElement                = _.get(options, 'targetIsResistantToElement');
	const targetIsWeakToElement                     = _.get(options, 'targetIsWeakToElement');
	const getCriticalHitFunction					= _.get(options, 'getCriticalHitFunction');
	const getDamageModificationsVarianceFunction	= _.get(options, 'getDamageModificationsVarianceFunction');


	let damage = 0;
	let criticalHit = getCriticalHitFunction();
	let damageModificationVariance = getDamageModificationsVarianceFunction();
	
	damage = getDamageStep1(
		attacker.vigor,
		attacker.battlePower,
		attacker.level,
		equippedWithGauntlet(attacker),
		equippedWithOffering(attacker),
		isPhysicalAttack,
		equippedWithGenjiGlove(attacker),
		oneOrZeroWeapons(attacker)
	);

	damage = getDamageStep2(
		damage,
		isPhysicalAttack,
		equippedWithAtlasArmlet(attacker),
		equippedWith1HeroRing(attacker),
		equippedWith2HeroRings(attacker),
		equippedWith1Earring(attacker),
		equippedWith2Earrings(attacker)
	);

	damage = getDamageStep3(
		damage,
		isPhysicalAttack,
		attackingMultipleTargets);

	damage = getDamageStep4(
		damage,
		attackerIsInBackRow
	);

	damage = getDamageStep5(
		damage,
		attackerHasMorphStatus,
		attackerHasBerserkStatusAndPhysicalAttack,
		criticalHit
	);

	damage = getDamageStep6(
		damage,
		attacker.defense,
		attacker.magicDefense,
		damageModificationVariance,
		isPhysicalAttack,
		targetHasSafeStatus,
		targetHasShellStatus,
		targetDefending,
		targetIsInBackRow,
		targetHasMorphStatus,
		targetIsSelf,
		targetIsCharacter,
		attackerIsCharacter
	);

	damage = getDamageStep7(
		damage,
		backOfTarget,
		isPhysicalAttack
	);

	damage = getDamageStep8(
		damage,
		targetHasPetrifyStatus
	);

	damage = getDamageStep9(
		damage,
		elementHasBeenNullified,
		targetAbsorbsElement,
		targetIsImmuneToElement,
		targetIsResistantToElement,
		targetIsWeakToElement
	);

	damage = Math.round(damage);
	damage = _.clamp(damage, -9999, 9999);

	// TODO: support attacking mulitple targets
	return getDamageResult(damage, criticalHit);

// should probably return an array of these...
//		targetHitResults.add(
//			new TargetHitResult(
//				criticalHit: criticalHit,
//				hit: hitResult.hit,
//				damage: damage,
//				removeImageStatus: hitResult.removeImageStatus,
//				target: target
//			)
//		);
}

module.exports = {
	getRandomNumberFromRange,
	getDamageStep1,
	getRandomMonsterVigor,
	getDamageStep2,
	getDamageStep3,
	getDamageStep4,
	getCriticalHit,
	getDamageStep5,
	getDamageModificationsVariance,
	getDamageStep6,
	getDamageStep7,
	getDamageStep8,
	getDamageStep9,
	getHit,
	step4e,
	getHitDefaultGetHitOptions,
	getDefaultDamageOptions,
	getDamage
};

/***/ }),
/* 7 */
/***/ (function(module, exports) {

module.exports = require("rx");

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = {
    battle: {
        battleTimer: __webpack_require__(1),
        battleUtils: __webpack_require__(6),
        character: __webpack_require__(2)
    },
    enums: {
        BattleState: __webpack_require__(3),
        Row: __webpack_require__(4)
    },
    relics: __webpack_require__(5)
};

/***/ })
/******/ ]);