module.exports = {
    battle: {
        battleTimer: require('./battle/battletimer'),
        battleUtils: require('./battle/battleutils'),
        character: require('./battle/character')
    },
    enums: {
        BattleState: require('./enums/BattleState'),
        Row: require('./enums/Row')
    },
    relics: require('./relics'),
    core: {
        guid: require('./core/guid')
    }
};