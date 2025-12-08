import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DataTable, type ColumnDef } from '../DataTable';

// Test data
interface TestData {
  id: string;
  name: string;
  email: string;
  status: string;
}

const testData: TestData[] = [
  { id: '1', name: 'John Doe', email: 'john@example.com', status: 'active' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', status: 'inactive' },
  { id: '3', name: 'Bob Wilson', email: 'bob@example.com', status: 'active' },
  { id: '4', name: 'Alice Brown', email: 'alice@example.com', status: 'pending' },
  { id: '5', name: 'Charlie Davis', email: 'charlie@example.com', status: 'active' },
];

const columns: ColumnDef<TestData, unknown>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'status',
    header: 'Status',
  },
];

describe('DataTable', () => {
  describe('rendering', () => {
    it('renders table with data', () => {
      render(<DataTable data={testData} columns={columns} />);

      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    });

    it('renders column headers', () => {
      render(<DataTable data={testData} columns={columns} />);

      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
    });

    it('renders empty state when no data', () => {
      render(<DataTable data={[]} columns={columns} emptyMessage="No users found" />);

      expect(screen.getByText('No users found')).toBeInTheDocument();
    });

    it('renders custom empty icon', () => {
      render(
        <DataTable
          data={[]}
          columns={columns}
          emptyMessage="Empty"
          emptyIcon={<span data-testid="empty-icon">🔍</span>}
        />
      );

      expect(screen.getByTestId('empty-icon')).toBeInTheDocument();
    });

    it('renders loading state', () => {
      render(<DataTable data={[]} columns={columns} loading />);

      const skeletonRows = document.querySelectorAll('.animate-pulse');
      expect(skeletonRows.length).toBeGreaterThan(0);
    });
  });

  describe('pagination', () => {
    const manyData = Array.from({ length: 25 }, (_, i) => ({
      id: String(i + 1),
      name: `User ${i + 1}`,
      email: `user${i + 1}@example.com`,
      status: 'active',
    }));

    it('shows pagination controls when enabled', () => {
      render(<DataTable data={manyData} columns={columns} pagination pageSize={10} />);

      expect(screen.getByLabelText('Go to first page')).toBeInTheDocument();
      expect(screen.getByLabelText('Go to previous page')).toBeInTheDocument();
      expect(screen.getByLabelText('Go to next page')).toBeInTheDocument();
      expect(screen.getByLabelText('Go to last page')).toBeInTheDocument();
    });

    it('navigates to next page', async () => {
      render(<DataTable data={manyData} columns={columns} pagination pageSize={10} />);

      expect(screen.getByText('User 1')).toBeInTheDocument();
      expect(screen.queryByText('User 11')).not.toBeInTheDocument();

      await userEvent.click(screen.getByLabelText('Go to next page'));

      expect(screen.queryByText('User 1')).not.toBeInTheDocument();
      expect(screen.getByText('User 11')).toBeInTheDocument();
    });

    it('changes page size', async () => {
      render(<DataTable data={manyData} columns={columns} pagination pageSize={5} />);

      const pageSizeSelect = screen.getByRole('combobox');
      await userEvent.selectOptions(pageSizeSelect, '20');

      // Should now show more items
      expect(screen.getByText('User 1')).toBeInTheDocument();
      expect(screen.getByText('User 15')).toBeInTheDocument();
    });

    it('disables prev/first buttons on first page', () => {
      render(<DataTable data={manyData} columns={columns} pagination pageSize={10} />);

      expect(screen.getByLabelText('Go to first page')).toBeDisabled();
      expect(screen.getByLabelText('Go to previous page')).toBeDisabled();
    });

    it('disables next/last buttons on last page', async () => {
      render(<DataTable data={manyData} columns={columns} pagination pageSize={10} />);

      await userEvent.click(screen.getByLabelText('Go to last page'));

      expect(screen.getByLabelText('Go to next page')).toBeDisabled();
      expect(screen.getByLabelText('Go to last page')).toBeDisabled();
    });

    it('hides pagination when disabled', () => {
      render(<DataTable data={manyData} columns={columns} pagination={false} />);

      expect(screen.queryByLabelText('Go to next page')).not.toBeInTheDocument();
    });
  });

  describe('search', () => {
    it('shows search input when searchable', () => {
      render(<DataTable data={testData} columns={columns} searchable />);

      expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
    });

    it('uses custom search placeholder', () => {
      render(
        <DataTable
          data={testData}
          columns={columns}
          searchable
          searchPlaceholder="Find users..."
        />
      );

      expect(screen.getByPlaceholderText('Find users...')).toBeInTheDocument();
    });

    it('filters data based on search', async () => {
      render(<DataTable data={testData} columns={columns} searchable pagination={false} />);

      const searchInput = screen.getByPlaceholderText('Search...');
      await userEvent.type(searchInput, 'Jane');

      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    });

    it('search is case insensitive', async () => {
      render(<DataTable data={testData} columns={columns} searchable pagination={false} />);

      const searchInput = screen.getByPlaceholderText('Search...');
      await userEvent.type(searchInput, 'JANE');

      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
  });

  describe('sorting', () => {
    it('sorts by column when header clicked', async () => {
      render(<DataTable data={testData} columns={columns} pagination={false} />);

      const nameHeader = screen.getByText('Name');
      await userEvent.click(nameHeader);

      const rows = screen.getAllByRole('row');
      // First row is header, second should be Alice (alphabetically first)
      const firstDataRow = rows[1];
      expect(within(firstDataRow).getByText('Alice Brown')).toBeInTheDocument();
    });

    it('toggles sort direction on repeated clicks', async () => {
      render(<DataTable data={testData} columns={columns} pagination={false} />);

      const nameHeader = screen.getByText('Name');

      // First click - ascending
      await userEvent.click(nameHeader);
      let rows = screen.getAllByRole('row');
      expect(within(rows[1]).getByText('Alice Brown')).toBeInTheDocument();

      // Second click - descending
      await userEvent.click(nameHeader);
      rows = screen.getAllByRole('row');
      expect(within(rows[1]).getByText('John Doe')).toBeInTheDocument();
    });
  });

  describe('selection', () => {
    it('shows selection checkboxes when selectable', () => {
      render(<DataTable data={testData} columns={columns} selectable />);

      const checkboxes = screen.getAllByRole('checkbox');
      // 1 for select all + 5 for each row
      expect(checkboxes.length).toBe(6);
    });

    it('selects individual rows', async () => {
      const onSelectionChange = vi.fn();
      render(
        <DataTable
          data={testData}
          columns={columns}
          selectable
          onSelectionChange={onSelectionChange}
        />
      );

      const rowCheckboxes = screen.getAllByLabelText('Select row');
      await userEvent.click(rowCheckboxes[0]);

      expect(onSelectionChange).toHaveBeenCalled();
    });

    it('selects all rows on page', async () => {
      const onSelectionChange = vi.fn();
      render(
        <DataTable
          data={testData}
          columns={columns}
          selectable
          onSelectionChange={onSelectionChange}
          pagination={false}
        />
      );

      const selectAllCheckbox = screen.getByLabelText('Select all');
      await userEvent.click(selectAllCheckbox);

      // Should show selection count
      expect(screen.getByText(/row\(s\) selected/)).toBeInTheDocument();
    });

    it('shows selection info when rows selected', async () => {
      render(<DataTable data={testData} columns={columns} selectable pagination={false} />);

      const rowCheckboxes = screen.getAllByLabelText('Select row');
      await userEvent.click(rowCheckboxes[0]);
      await userEvent.click(rowCheckboxes[1]);

      expect(screen.getByText('2 row(s) selected')).toBeInTheDocument();
    });
  });

  describe('column toggle', () => {
    it('shows column toggle button when enabled', () => {
      render(<DataTable data={testData} columns={columns} columnToggle />);

      expect(screen.getByText('Columns')).toBeInTheDocument();
    });

    it('opens column visibility menu', async () => {
      render(<DataTable data={testData} columns={columns} columnToggle />);

      await userEvent.click(screen.getByText('Columns'));

      // Should show column names in menu
      expect(screen.getAllByText('name').length).toBeGreaterThan(0);
    });

    it('toggles column visibility', async () => {
      render(<DataTable data={testData} columns={columns} columnToggle pagination={false} />);

      // Email column should be visible initially
      expect(screen.getByText('john@example.com')).toBeInTheDocument();

      // Open menu and toggle email column
      await userEvent.click(screen.getByText('Columns'));

      const emailToggle = screen.getByRole('button', { name: /email/i });
      await userEvent.click(emailToggle);

      // Close menu
      await userEvent.click(document.body);

      // Email column should be hidden
      expect(screen.queryByText('john@example.com')).not.toBeInTheDocument();
    });
  });

  describe('styling variants', () => {
    it('applies striped styling', () => {
      render(<DataTable data={testData} columns={columns} striped />);

      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();
    });

    it('applies bordered styling', () => {
      const { container } = render(<DataTable data={testData} columns={columns} bordered />);

      expect(container.querySelector('.border')).toBeInTheDocument();
    });

    it('applies compact styling', () => {
      render(<DataTable data={testData} columns={columns} compact />);

      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();
    });

    it('applies sticky header', () => {
      render(<DataTable data={testData} columns={columns} stickyHeader />);

      const thead = document.querySelector('thead');
      expect(thead?.classList.contains('sticky')).toBe(true);
    });

    it('accepts custom className', () => {
      const { container } = render(
        <DataTable data={testData} columns={columns} className="custom-class" />
      );

      expect(container.querySelector('.custom-class')).toBeInTheDocument();
    });
  });
});
