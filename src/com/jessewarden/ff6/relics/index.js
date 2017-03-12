// http://www.rpglegion.com/ff6/items/relics.htm

const _ = require("lodash");

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