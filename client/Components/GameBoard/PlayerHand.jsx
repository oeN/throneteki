import React from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore';
import $ from 'jquery';

import Card from './Card';
import { tryParseJSON } from '../../util';

class PlayerHand extends React.Component {
    constructor(props) {
        super(props);

        this.state = {};

        this.onCardClick = this.onCardClick.bind(this);
    }

    onDragOver(event) {
        $(event.target).addClass('highlight-panel');
        event.preventDefault();
    }

    onDragLeave(event) {
        $(event.target).removeClass('highlight-panel');
    }

    onDragDrop(event, target) {
        event.stopPropagation();
        event.preventDefault();

        $(event.target).removeClass('highlight-panel');

        let card = event.dataTransfer.getData('Text');

        if(!card) {
            return;
        }

        let dragData = tryParseJSON(card);
        if(!dragData) {
            return;
        }

        if(this.props.onDragDrop) {
            this.props.onDragDrop(dragData.card, dragData.source, target);
        }
    }

    disableMouseOver(revealWhenHiddenTo) {
        if(this.props.spectating && this.props.showHand) {
            return false;
        }

        if(revealWhenHiddenTo === this.props.username) {
            return false;
        }

        return !this.props.isMe;
    }

    onCardMouseOver(cardIndex, card) {
        if(this.state.currentMouseOver === cardIndex) {
            clearTimeout(this.outTimeout);
        } else {
            this.overTimeout = setTimeout(() => {
                this.setState({ currentMouseOver: cardIndex });
            }, 200);
        }

        if(this.props.onMouseOver) {
            this.props.onMouseOver(card);
        }
    }

    onCardMouseOut(cardIndex, card) {
        clearTimeout(this.overTimeout);

        if(this.state.currentMouseOver === cardIndex) {
            this.outTimeout = setTimeout(() => {
                this.setState({ currentMouseOver: undefined });
            }, 200);
        }

        if(this.props.onMouseOut) {
            this.props.onMouseOut(card);
        }
    }

    onCardClick(card) {
        this.setState({currentMouseOver: undefined});

        if(this.props.onCardClick) {
            this.props.onCardClick(card);
        }
    }

    getCards() {
        let cards = this.props.cards;
        let cardIndex = 0;

        if(!this.props.isMe) {
            cards = _.sortBy(this.props.cards, card => card.revealWhenHiddenTo);
        }

        let numCards = cards.length;
        let midPoint = Math.floor(numCards / 2);
        if(midPoint < 0) {
            midPoint = 1;
        }

        let hand = _.map(cards, card => {
            let style = {};
            let rotateStyle = {};
            let totalAngle = 120;
            let sideIndex = cardIndex - midPoint;

            let rotation = totalAngle / numCards * sideIndex;

            rotateStyle.transform = `rotate(${rotation}deg)`;
            if(this.state.currentMouseOver === cardIndex) {
                style.transform = ' translateY(-70px) scale(2.5)';
                rotateStyle.transform = '';
            } else if(cardIndex < this.state.currentMouseOver) {
                rotateStyle.transform += ' translateX(-20px)';
            } else if(cardIndex > this.state.currentMouseOver) {
                rotateStyle.transform += ' translateX(20px)';
            }

            cardIndex++;

            return (<div className='card-wrapper' style={ rotateStyle }>
                <Card ref={ card.uuid } key={ card.uuid } card={ card } style={ style } disableMouseOver={ this.disableMouseOver(card.revealWhenHiddenTo) } source='hand'
                    onMouseOver={ this.onCardMouseOver.bind(this, cardIndex) }
                    onMouseOut={ this.onCardMouseOut.bind(this, cardIndex, card) }
                    onClick={ this.onCardClick }
                    onDragDrop={ this.props.onDragDrop }
                    size={ this.props.cardSize } />
            </div>);
        });

        return hand;
    }

    render() {
        let className = 'hand';

        if(this.props.cardSize !== 'normal') {
            className += ` ${this.props.cardSize}`;
        }

        let cards = this.getCards();

        return (
            <div className={ className }
                onDragLeave={ this.onDragLeave }
                onDragOver={ this.onDragOver }
                onDrop={ event => this.onDragDrop(event, 'hand') }>

                <div className='panel-header'>
                    { 'Hand (' + cards.length + ')' }
                </div>
                { cards }
            </div>
        );
    }
}

PlayerHand.displayName = 'PlayerHand';
PlayerHand.propTypes = {
    cardSize: PropTypes.string,
    cards: PropTypes.array,
    isMe: PropTypes.bool,
    onCardClick: PropTypes.func,
    onDragDrop: PropTypes.func,
    onMouseOut: PropTypes.func,
    onMouseOver: PropTypes.func,
    showHand: PropTypes.bool,
    spectating: PropTypes.bool,
    username: PropTypes.string
};

export default PlayerHand;
