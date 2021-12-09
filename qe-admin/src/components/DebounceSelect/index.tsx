import React from 'react';
import 'antd/dist/antd.css';
import { Select, Spin } from 'antd';
import debounce from 'lodash/debounce';



const DebounceSelect = ({ fetchOptions, debounceTimeout = 800, ...props }:any) => {
  const [fetching, setFetching] = React.useState(false);
  const [options, setOptions] = React.useState(props.options || []);
  const fetchRef = React.useRef(0);

  const debounceFetcher = React.useMemo(() => {
    const loadOptions = (value:any) => {
      fetchRef.current += 1;
      const fetchId = fetchRef.current;
      setOptions([]);
      setFetching(true);
      fetchOptions(value).then((newOptions:any) => {
        if (fetchId !== fetchRef.current) {
          // for fetch callback order
          return;
        }

        setOptions(newOptions);
        setFetching(false);
      });
    };

    return debounce(loadOptions, debounceTimeout);
  }, [fetchOptions, debounceTimeout]);


  return (
    <Select
      labelInValue
      filterOption={false}
      onSearch={debounceFetcher}
      notFoundContent={fetching ? <Spin size="small" /> : null}
      {...props}
      defaultValue="lucy"
      options={options}
    />
  )
}

export default DebounceSelect



