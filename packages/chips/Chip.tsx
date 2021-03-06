// The MIT License
//
// Copyright (c) 2018 Google, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
import * as React from 'react';
import * as classnames from 'classnames';
import * as Ripple from '@material/react-ripple';
// @ts-ignore no mdc .d.ts file
import {MDCChipFoundation} from '@material/chips/dist/mdc.chips';

export interface ChipProps extends Ripple.InjectedProps<HTMLDivElement> {
  id?: string;
  label?: string;
  className?: string;
  selected?: boolean;
  handleSelect?: (id: string, selected: boolean) => void;
  handleRemove?: (id: string) => void;
  handleInteraction?: (id: string) => void;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  onKeyDown?: React.KeyboardEventHandler<HTMLDivElement>;
  onTransitionEnd?: React.TransitionEventHandler<HTMLDivElement>;
  chipCheckmark?: React.ReactElement<HTMLElement>;
  leadingIcon?: React.ReactElement<HTMLElement>;
  removeIcon?: React.ReactElement<HTMLElement>;
  initRipple: (surface: HTMLElement | null) => void;
};

type ChipState = {
  classList: Set<string>;
  leadingIconClassList: Set<string>;
};

export class Chip extends React.Component<ChipProps, ChipState> {
  chipElement: HTMLDivElement | null = null;
  foundation?: MDCChipFoundation;

  static defaultProps: Partial<ChipProps> = {
    id: '',
    label: '',
    className: '',
    selected: false,
    onClick: () => {},
    onKeyDown: () => {},
    onTransitionEnd: () => {},
    initRipple: () => {},
    handleSelect: () => {},
    handleRemove: () => {},
    handleInteraction: () => {},
  };

  state = {
    classList: new Set(),
    leadingIconClassList: new Set(),
  };

  componentDidMount() {
    this.foundation = new MDCChipFoundation(this.adapter);
    this.foundation.init();
    this.foundation.setSelected(this.props.selected);
  }

  componentDidUpdate(prevProps: ChipProps) {
    if (this.props.selected !== prevProps.selected) {
      this.foundation.setSelected(this.props.selected);
    }
  }

  componentWillUnmount() {
    this.foundation.destroy();
  }

  init = (el: HTMLDivElement | null) => {
    this.chipElement = el;
    this.props.initRipple && this.props.initRipple(el);
  };

  get classes() {
    const {classList} = this.state;
    const {className} = this.props;
    return classnames('mdc-chip', Array.from(classList), className);
  }

  get adapter() {
    return {
      addClass: (className: string) => {
        const classList = new Set(this.state.classList);
        classList.add(className);
        this.setState({classList});
      },
      removeClass: (className: string) => {
        const classList = new Set(this.state.classList);
        classList.delete(className);
        this.setState({classList});
      },
      hasClass: (className: string) => this.classes.split(' ').includes(className),
      eventTargetHasClass: (target: HTMLElement, className: string) =>
        target.classList.contains(className),
      getComputedStyleValue: (propertyName: string) => {
        if (!this.chipElement) return;
        return window
          .getComputedStyle(this.chipElement)
          .getPropertyValue(propertyName);
      },
      setStyleProperty: (propertyName: keyof React.CSSProperties, value: string | null) => {
        if (!this.chipElement) return;
        this.chipElement.style.setProperty(propertyName, value);
      },
      notifyRemoval: () => this.props.handleRemove!(this.props.id!),
      notifyInteraction: () => this.props.handleInteraction!(this.props.id!),
      notifySelection: (selected: boolean) =>
        this.props.handleSelect!(this.props.id!, selected),
      addClassToLeadingIcon: (className: string) => {
        const leadingIconClassList = new Set(this.state.leadingIconClassList);
        leadingIconClassList.add(className);
        this.setState({leadingIconClassList});
      },
      removeClassFromLeadingIcon: (className: string) => {
        const leadingIconClassList = new Set(this.state.leadingIconClassList);
        leadingIconClassList.delete(className);
        this.setState({leadingIconClassList});
      },
    };
  }

  onClick = (e: React.MouseEvent<HTMLDivElement>) => {
    this.props.onClick!(e);
    this.foundation.handleInteraction(e);
  };

  onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    this.props.onKeyDown!(e);
    this.foundation.handleInteraction(e);
  };

  handleRemoveIconClick = (e: React.MouseEvent) => this.foundation.handleTrailingIconInteraction(e);

  handleTransitionEnd = (e: React.TransitionEvent<HTMLDivElement>) => {
    this.props.onTransitionEnd!(e);
    this.foundation.handleTransitionEnd(e);
  };

  renderLeadingIcon = (leadingIcon: React.ReactElement<HTMLElement>) => {
    const {leadingIconClassList} = this.state;
    const {className, ...otherProps} = leadingIcon.props;
    const props = {
      className: classnames(
        className,
        Array.from(leadingIconClassList),
        'mdc-chip__icon',
        'mdc-chip__icon--leading'
      ),
      ...otherProps,
    };
    return React.cloneElement(leadingIcon, props);
  };

  renderRemoveIcon = (removeIcon: React.ReactElement<HTMLElement>) => {
    const {className, ...otherProps} = removeIcon.props;
    const props = {
      className: classnames(
        className,
        'mdc-chip__icon',
        'mdc-chip__icon--trailing'
      ),
      onClick: this.handleRemoveIconClick,
      onKeyDown: this.handleRemoveIconClick,
      tabIndex: 0,
      role: 'button',
      ...otherProps,
    };
    return React.cloneElement(removeIcon, props);
  };

  render() {
    const {
      /* eslint-disable no-unused-vars */
      id,
      className,
      selected,
      handleSelect,
      handleInteraction,
      handleRemove,
      onClick,
      onKeyDown,
      onTransitionEnd,
      computeBoundingRect,
      initRipple,
      unbounded,
      /* eslint-enable no-unused-vars */
      chipCheckmark,
      leadingIcon,
      removeIcon,
      label,
      ...otherProps
    } = this.props;
    return (
      <div
        tabIndex={0}
        className={this.classes}
        onClick={this.onClick}
        onKeyDown={this.onKeyDown}
        onTransitionEnd={this.handleTransitionEnd}
        ref={this.init}
        {...otherProps}
      >
        {leadingIcon ? this.renderLeadingIcon(leadingIcon) : null}
        {chipCheckmark}
        <div className='mdc-chip__text'>{label}</div>
        {removeIcon ? this.renderRemoveIcon(removeIcon) : null}
      </div>
    );
  }
}

export default Ripple.withRipple<ChipProps, HTMLDivElement>(Chip);
