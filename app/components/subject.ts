import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

interface ArgsInterface {
  index: number;
  // subject arguments
  subject: {
    uri: string;
    class: string;
    className: string;
    usedShape?: string;
    shapeName?: string;
    totalCount: number;
    validCount?: number;
  };

  // entry arguments
  firstLevel: boolean;
  alertSkin?: string;
}

export default class Subject extends Component<ArgsInterface> {
  get skin() {
    const { validCount, totalCount } = this.args.subject;
    const { firstLevel, alertSkin } = this.args;

    if (alertSkin) return alertSkin;

    if (firstLevel && validCount! < totalCount!) return 'error';
    if (!firstLevel && validCount !== undefined && totalCount !== undefined) {
      if (validCount === totalCount) return 'success';
      if (validCount !== totalCount) return 'warning';
    }
    return 'info';
  }
  get displayClass() {
    const { validCount, totalCount } = this.args.subject;
    const { firstLevel } = this.args;

    if (firstLevel && !(validCount! < totalCount!)) {
      return 'au-c-alert--neutral au-u-margin-bottom';
    }
    return 'au-u-margin-bottom';
  }

  get formattedName() {
    const { shapeName, className } = this.args.subject;
    return className || shapeName || name || 'Unvalidated subject';
  }

  get displayCounts() {
    const { validCount, totalCount } = this.args.subject;
    if (validCount !== undefined && totalCount !== undefined) {
      return `${validCount}/${totalCount}`;
    } else if (totalCount !== undefined) {
      return totalCount.toString();
    }
    return '';
  }

  get displayIndex() {
    if (this.args.index === undefined) return '';
    return this.args.index + 1;
  }

  get displayURI() {
    return this.args.subject.uri || '';
  }

  get hasURL() {
    return !!this.args.subject.uri;
  }

  get countText() {
    const { validCount, totalCount } = this.args.subject;

    // When validCount and totalCount are both available
    if (validCount !== undefined && totalCount !== undefined) {
      return `${validCount}/${totalCount}`;
    }

    // When only totalCount is available
    if (totalCount !== undefined && validCount === undefined) {
      return totalCount;
    }

    return '';
  }
}
