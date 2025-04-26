export const getBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
<<<<<<< HEAD
      reader.onerror = (error) => reject(error);
    });
=======
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
>>>>>>> c1949cc (Bao cao lan 3)
