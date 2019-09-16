function Calculation () {

    this.selectClasses = (classSelector ,type) => Array.from(document.querySelectorAll(classSelector)).map(e => {
        return type === 'num' ? +e.value : e.value;
    });    
   
    this.info = () => { 
        [
            names,
            amountOfPeople,
            tariffs,
            billUsage,
            meters,
        ] = [
            ['.family-names', 'str'],
            ['.amount-of-people', 'num'],
            ['.prices', 'num'],
            ['.usage-amount', 'num'],
            ['.meters input', 'num'],
        
        ].map((c) => this.selectClasses(c[0],`${ c[1] === 'num' ? 'num':'str'}`));
        
        usage = meters.map((a,i,t) => i%2 !==0 ? a-(t[i-1]): null).filter(n => n !== null);
        // calculate usage of  main consumer & add to array
        usage.unshift(billUsage.reduce((a,v) => a+v, 0) - usage.reduce((a,v) => a+v, 0));  
        
        return ({
            names,
            amountOfPeople,
            tariffs,
            billUsage,
            usage,
            meters
        });
    }
    this.someUsedLessThanAllowed = (used, allowed) => used.some((u, i) => u < allowed[i]);

    this.spreadRest = (used, allowed, people) => {
        const usedLess = used.map((u,i) => u <= allowed[i] ? u : undefined);  //  hold track of trh indeexes indicies
        console.log('used: ',used)
        console.log('usedLess: ',usedLess)
        console.log('allowed: ', allowed)
        const leftOvers = usedLess.map((u,i) => u !== undefined ? allowed[i] - u : undefined)
                                  .filter(e => e)
                                  .reduce((a,v) => a+v, 0);
    
        const amountOfPeopleUsedMore = usedLess.map((u, i) => u !== undefined ? undefined : people[i])
                                               .filter(e => e)  // filter out undefined values
                                               .reduce((a,v) => a+v, 0);
    
        const addToEveryOne = leftOvers / amountOfPeopleUsedMore;
        const newAllowed = used.map((u, i) => {
            return usedLess[i] === undefined ? allowed[i] + (addToEveryOne * people[i]) : used[i]
        });
        console.log(newAllowed)
        return newAllowed;
    }

    this.result = () => {
        const allowedAmountForPerson = this.info().billUsage[0] / this.info().amountOfPeople.reduce((a,v) => a+v, 0);
        
        // TODO: handle use-case when 1 or more tenants have used *less* then allowed.
        let allowedForEachTenant = this.info().amountOfPeople.map(t => t * allowedAmountForPerson);
        console.log(allowedForEachTenant)
        let counter = 0
        while (this.someUsedLessThanAllowed(this.info().usage, allowedForEachTenant)) {
            console.log('before: ', allowedForEachTenant);
            counter++
            console.log(counter)
            if (counter > 15) debugger;
            allowedForEachTenant = this.spreadRest(this.info().usage, allowedForEachTenant, this.info().amountOfPeople);
            console.log('after: ',allowedForEachTenant)
        }

        const tariff1ToPay = allowedForEachTenant.map(a => a * this.info().tariffs[0]);
        const tariff2ToPay = this.info().usage.map((p, i) => (p - allowedForEachTenant[i]) * this.info().tariffs[1])
        const totalToPay = tariff1ToPay.map((t, i) => t+ tariff2ToPay[i]);

        return ({
            allowedAmountForPerson,
            allowedForEachTenant,
            tariff1ToPay,
            tariff2ToPay,
            totalToPay
        })
    }

    this.validate = () => this.info().usage[0] >= 0;

    
    

}


function calculate() {
    const calculation = new Calculation();
    
    if (!calculation.validate()) {
        alert('סך השימוש ע"י הדיירים יותר מהחשבונית');
        return false;
    }
    let table = document.querySelector('table');
    html = `
    <tr>
        <th>שם</th>
        <th>תעריף</th>
        <th>צריכה</th>
        <th>תשלום</th>
    </tr>
    `;
    // console.log(calculation.info())
    // console.log(calculation.result())
   
    calculation.info().names.forEach((n, i) => html += `

        <tr>
            <td rowspan="2">${n}</td>
            <td>תעריף 1</td>
            <td>${calculation.result().allowedForEachTenant[i].toFixed(2)} מ"ק</td>
            <td rowspan="2">${calculation.result().totalToPay[i].toFixed(2)} ‎₪</td>
        </tr>
        <tr>
            <td>תעריף 2</td>
            <td>${(calculation.info().usage[i] - calculation.result().allowedForEachTenant[i]).toFixed(2)} מ"ק</td> 
        </tr>`
    );

    table.innerHTML += html;
}





const addConsumer = () => {
    document.querySelectorAll('.add-button, .remove-button').forEach(btn => btn.remove());

    let consumerHTML = `
        <div class="consumer">
                <div class="input-container">
                    <input class="family-names" type="text"  placeholder="שם" value="">
                    <input class="amount-of-people" type="number"  placeholder="נפשות" value="">
                </div>
                <div class="input-container meters">
                    <input type="number"  placeholder="קריאת מונה קודמת" value="">
                    <input type="number"  placeholder="קריאת מונה נוכחית" value="">
                </div>
            </div>  
        `

    document.querySelector('.secondary-consumers').innerHTML += consumerHTML;
          
    document.querySelector('.add-remove-buttons').innerHTML += `
        <button type="button" class="add-button" onclick="addConsumer()">+</button>
        <button type="button" class="remove-button" onclick="removeConsumer()">-</button>
    `
}


const removeConsumer = () => document.querySelector('.secondary-consumers').lastElementChild.remove();


