export const getBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject
    });
    export const renderOptions = (arr) =>{
      let results = []
      if(arr){
          results = arr?.map((otp) =>{
              return{
                  value: otp,
                  label: otp
              }
          })
      }
      results.push({
          label: 'Thêm type',
          value: 'add_type'
      })
      return results
  }