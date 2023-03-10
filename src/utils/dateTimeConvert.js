class DateTimeConvert{

        convertTimestampToDate(timeStamp){

                const dateFormat= new Date(timeStamp);
                return dateFormat.getDate()+
                        "/"+(dateFormat.getMonth()+1)+
                        "/"+dateFormat.getFullYear()+
                        " "+dateFormat.getHours()+
                        ":"+dateFormat.getMinutes()+
                        ":"+dateFormat.getSeconds();
                }

        ConvertDateToTimestamp(dateTime)
        {
            Math.floor(dateTime)
        }
    
}


module.exports = new DateTimeConvert