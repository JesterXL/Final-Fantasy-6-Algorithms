const Row = require("../enums/Row");
const _ = require("lodash");
const {Subject} = require("rx");
const {BattleTimer, MODE_PLAYER, EFFECT_NORMAL} = require('./battletimer');
const BattleState = require('../enums/BattleState');
const {
	isGauntlet,
	isAtlasArmlet,
	isEarring,
	isGenjiGlove,
	isHeroRing,
	isOffering
} = require('../relics');

const none = _.negate(_.every);
const notNil = _.negate(_.isNil);

let _INCREMENT = 0;

const getCharacter = (entity)=>
{
	var vm = {};
	vm.entity = entity;
	vm.percentage = 0;
	vm.name = 'default';
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
	vm.row = Row.FRONT;
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

const toggleRow = chr =>
{
	if(chr.row === Row.FRONT)
	{
		return Row.BACK;
	}
	else
	{
		return Row.FRONT;
	}
};

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