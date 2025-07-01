import React from 'react';
import { TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

interface SearchbarProps {
  value: string;
  onChange: (value: string) => void;
}

const Searchbar: React.FC<SearchbarProps> = ({ value, onChange }) => (
  <TextField
    fullWidth
    variant="outlined"
    placeholder="Search tickets..."
    value={value}
    onChange={e => onChange(e.target.value)}
    size="small"
    sx={{ mb: 2 }}
    InputProps={{
      startAdornment: (
        <InputAdornment position="start">
          <SearchIcon />
        </InputAdornment>
      ),
    }}
  />
);

export default Searchbar;
