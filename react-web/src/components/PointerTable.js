import React from 'react';
import { Table } from 'patternfly-react';

export class PointerTable extends React.Component {

  constructor(props) {
    super(props);

    this.headerFormat = this.headerFormat.bind(this);
    this.nameCellFormat = this.nameCellFormat.bind(this);
    this.scoreCellFormat = this.scoreCellFormat.bind(this);

    this.pointerTableColumns = [
      {
        header: {
          label: 'Story Pointer',
          formatters: [this.headerFormat]
        },
        cell: {
          formatters: [this.nameCellFormat]
        },
        property: 'name'
      },
      {
        header: {
          label: 'Points',
          formatters: [this.headerFormat]
        },
        cell: {
          formatters: [this.scoreCellFormat]
        },
        property: 'score'
      }
    ];
  }

  headerFormat(value) {
    return <Table.Heading>{value}</Table.Heading>;
  }

  nameCellFormat(value) {
    return <Table.Cell>{value}</Table.Cell>;
  }

  scoreCellFormat(value, extra) {
    if (extra.rowData.show) {
      return <Table.Cell>{value || '-'}</Table.Cell>;
    } else if (!extra.rowData.show) {
      return <Table.Cell>{value ? '✔' : '-'}</Table.Cell>;
    }
  }

  render() {
    return( 
      <div className="pointertable">
        <Table.PfProvider
          striped
          bordered
          hover
          columns={this.pointerTableColumns}
        >
          <Table.Header />
          <Table.Body rows={this.props.pointers} rowKey="name" />
        </Table.PfProvider>
      </div>
    );
  }
}
