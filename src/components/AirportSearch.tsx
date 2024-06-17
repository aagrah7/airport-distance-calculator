import React, { useState } from 'react';
import axios from 'axios';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import './AirportSearch.css';

interface Airport {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    iata: string;
}

interface AirportSearchProps {
    label: string;
    onAirportSelect: (airport: Airport) => void;
}

const AirportSearch: React.FC<AirportSearchProps> = ({ label, onAirportSelect }) => {
    const [options, setOptions] = useState<Airport[]>([]);
    const [searchValue, setSearchValue] = useState<string>('');

    const handleInputChange = async (event: React.ChangeEvent<{}>, value: string) => {
        setSearchValue(value);
        if (value.length > 2) {
            try {
                const response = await axios.get('https://api.skypicker.com/locations', {
                    params: {
                        term: value,
                        locale: 'en-US',
                        location_types: 'airport',
                        limit: 10,
                    },
                });

                const data = response.data.locations
                    .filter((location: any) => location.city.country.id === 'US')
                    .map((location: any) => ({
                        id: location.id,
                        name: location.name,
                        latitude: location.location.lat,
                        longitude: location.location.lon,
                        iata: location.id,
                    }));
                setOptions(data);
            } catch (error) {
                console.error("Error fetching airport data: ", error);
            }
        }
    };

    const filterOptions = (options: Airport[], state: any) => {
        return options;
    };

    return (
        <div className="autocomplete-container">
            <Autocomplete
                options={options}
                filterOptions={filterOptions}
                getOptionLabel={(option) => `${option.name} (${option.iata})`}
                isOptionEqualToValue={(option, value) => option.iata === value.iata}
                onChange={(event, value) => onAirportSelect(value as Airport)}
                onInputChange={(event, value) => handleInputChange(event, value)}
                renderInput={(params) => <TextField {...params} label={label} variant="outlined" className="input" />}
            />
        </div>
    );
};

export default AirportSearch;
