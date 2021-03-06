import * as React from 'react';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { DetailsList, Selection, IColumn, buildColumns, IColumnReorderOptions } from 'office-ui-fabric-react/lib/DetailsList';
import { MarqueeSelection } from 'office-ui-fabric-react/lib/MarqueeSelection';
import { IDragDropEvents, IDragDropContext } from 'office-ui-fabric-react/lib/utilities/dragdrop/interfaces';
import { createListItems, IExampleItem } from 'office-ui-fabric-react/lib/utilities/exampleData';
import { TextField, ITextFieldStyles } from 'office-ui-fabric-react/lib/TextField';
import { Toggle } from 'office-ui-fabric-react/lib/Toggle';
import { getTheme, mergeStyles } from 'office-ui-fabric-react/lib/Styling';

const theme = getTheme();
const margin = '0 30px 20px 0';
const dragEnterClass = mergeStyles({
  backgroundColor: theme.palette.neutralLight
});
const controlWrapperClass = mergeStyles({
  display: 'flex',
  flexWrap: 'wrap'
});
const textFieldStyles: Partial<ITextFieldStyles> = {
  root: { margin: margin },
  fieldGroup: { maxWidth: '100px' }
};

let _draggedItem: IExampleItem | null = null;
let _draggedIndex = -1;
const _items: IExampleItem[] = createListItems(10, 0);

export interface IDetailsListDragDropExampleState {
  items: IExampleItem[];
  columns: IColumn[];
  isColumnReorderEnabled: boolean;
  frozenColumnCountFromStart: string;
  frozenColumnCountFromEnd: string;
}

export class DetailsListDragDropExample extends React.Component<{}, IDetailsListDragDropExampleState> {
  private _selection: Selection;
  private _dragDropEvents: IDragDropEvents;

  constructor(props: {}) {
    super(props);

    this._dragDropEvents = this._getDragDropEvents();
    this._selection = new Selection();

    this.state = {
      items: _items,
      columns: buildColumns(_items, true),
      isColumnReorderEnabled: true,
      frozenColumnCountFromStart: '1',
      frozenColumnCountFromEnd: '0'
    };
  }

  public render(): JSX.Element {
    const { items, columns, isColumnReorderEnabled, frozenColumnCountFromStart, frozenColumnCountFromEnd } = this.state;

    return (
      <div>
        <div className={controlWrapperClass}>
          <Toggle
            label="Enable column reorder"
            checked={isColumnReorderEnabled}
            onChange={this._onChangeColumnReorderEnabled}
            onText="Enabled"
            offText="Disabled"
            styles={{ root: { margin: margin } }}
          />
          <TextField
            label="Number of left frozen columns"
            onGetErrorMessage={this._validateNumber}
            value={frozenColumnCountFromStart}
            onChange={this._onChangeStartCountText}
            styles={textFieldStyles}
          />
          <TextField
            label="Number of right frozen columns"
            onGetErrorMessage={this._validateNumber}
            value={frozenColumnCountFromEnd}
            onChange={this._onChangeEndCountText}
            styles={textFieldStyles}
          />
        </div>
        <MarqueeSelection selection={this._selection}>
          <DetailsList
            setKey="items"
            items={items}
            columns={columns}
            selection={this._selection}
            selectionPreservedOnEmptyClick={true}
            onItemInvoked={this._onItemInvoked}
            onRenderItemColumn={this._onRenderItemColumn}
            dragDropEvents={this._dragDropEvents}
            columnReorderOptions={this.state.isColumnReorderEnabled ? this._getColumnReorderOptions() : undefined}
            ariaLabelForSelectionColumn="Toggle selection"
            ariaLabelForSelectAllCheckbox="Toggle selection for all items"
          />
        </MarqueeSelection>
      </div>
    );
  }

  private _handleColumnReorder = (draggedIndex: number, targetIndex: number) => {
    const draggedItems = this.state.columns[draggedIndex];
    const newColumns: IColumn[] = [...this.state.columns];

    // insert before the dropped item
    newColumns.splice(draggedIndex, 1);
    newColumns.splice(targetIndex, 0, draggedItems);
    this.setState({ columns: newColumns });
  };

  private _getColumnReorderOptions(): IColumnReorderOptions {
    return {
      frozenColumnCountFromStart: parseInt(this.state.frozenColumnCountFromStart, 10),
      frozenColumnCountFromEnd: parseInt(this.state.frozenColumnCountFromEnd, 10),
      handleColumnReorder: this._handleColumnReorder
    };
  }

  private _validateNumber(value: string): string {
    return isNaN(Number(value)) ? `The value should be a number, actual is ${value}.` : '';
  }

  private _onChangeStartCountText = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, text: string): void => {
    this.setState({ frozenColumnCountFromStart: text });
  };

  private _onChangeEndCountText = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, text: string): void => {
    this.setState({ frozenColumnCountFromEnd: text });
  };

  private _onChangeColumnReorderEnabled = (ev: React.MouseEvent<HTMLElement>, checked: boolean): void => {
    this.setState({ isColumnReorderEnabled: checked });
  };

  private _getDragDropEvents(): IDragDropEvents {
    return {
      canDrop: (dropContext?: IDragDropContext, dragContext?: IDragDropContext) => {
        return true;
      },
      canDrag: (item?: any) => {
        return true;
      },
      onDragEnter: (item?: any, event?: DragEvent) => {
        // return string is the css classes that will be added to the entering element.
        return dragEnterClass;
      },
      onDragLeave: (item?: any, event?: DragEvent) => {
        return;
      },
      onDrop: (item?: any, event?: DragEvent) => {
        if (_draggedItem) {
          this._insertBeforeItem(item);
        }
      },
      onDragStart: (item?: any, itemIndex?: number, selectedItems?: any[], event?: MouseEvent) => {
        _draggedItem = item;
        _draggedIndex = itemIndex!;
      },
      onDragEnd: (item?: any, event?: DragEvent) => {
        _draggedItem = null;
        _draggedIndex = -1;
      }
    };
  }

  private _onItemInvoked = (item: IExampleItem): void => {
    alert(`Item invoked: ${item.name}`);
  };

  private _onRenderItemColumn = (item: IExampleItem, index: number, column: IColumn): JSX.Element | string => {
    const key = column.key as keyof IExampleItem;
    if (key === 'name') {
      return <Link data-selection-invoke={true}>{item[key]}</Link>;
    }

    return String(item[key]);
  };

  private _insertBeforeItem(item: IExampleItem): void {
    const draggedItems = this._selection.isIndexSelected(_draggedIndex)
      ? (this._selection.getSelection() as IExampleItem[])
      : [_draggedItem!];

    const items = this.state.items.filter(itm => draggedItems.indexOf(itm) === -1);
    let insertIndex = items.indexOf(item);

    // if dragging/dropping on itself, index will be 0.
    if (insertIndex === -1) {
      insertIndex = 0;
    }

    items.splice(insertIndex, 0, ...draggedItems);

    this.setState({ items: items });
  }
}
