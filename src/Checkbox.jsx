export default function Checkbox({children, onChange}) {
    return(
    <div class="flex items-center">
        <input type="checkbox" value="" onChange={onChange} class="w-4 h-4 text-[#e97c29] bg-[#24292c] rounded focus:ring-transparent border-none"/>
        <label class="ml-2 text-sm font-medium text-white dark:text-gray-300">{children}</label>
    </div>
    )
}